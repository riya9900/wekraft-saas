"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  BackgroundVariant,
  type Node,
  type Edge,
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { FolderNode } from './action';
import { MoveRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Custom Node Component ---
const FolderNodeComponent = (props: NodeProps) => {
    const data = props.data as { label: string; level: number; isExpanded: boolean };
    const { label, isExpanded, level } = data;
    const isRoot = level === 0;
    
    return (
        <div className={cn(
            "px-6 py-2.5 rounded-xl border transition-all duration-300 min-w-[140px] flex flex-col items-center justify-center cursor-pointer select-none relative group",
            isRoot 
                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105" 
                : "bg-[#0D0D0D] border-zinc-800 hover:border-zinc-500 text-zinc-100 shadow-xl",
            isExpanded && !isRoot && "ring-1 ring-white/10 border-white/60 bg-[#161616]"
        )}>
            {/* Connection Points */}
            <Handle type="target" position={Position.Left} className="w-1 h-1 !bg-current !border-none !opacity-0" />
            
            <div className="flex flex-col items-center">
                {isRoot && <span className="text-[9px] uppercase font-black tracking-widest mb-0.5 opacity-50">Root</span>}
                <span className={cn(
                    "text-[12px] tracking-wide text-center",
                    isRoot ? "font-bold" : "font-medium"
                )}>{label}</span>
            </div>

            <Handle type="source" position={Position.Right} className="w-1 h-1 !bg-current !border-none !opacity-0" />
        </div>
    );
};

const nodeTypes = {
  folderNode: FolderNodeComponent,
};

interface HeatmapFlowProps {
  structure: FolderNode | null;
}

export const HeatmapFlow = ({ structure }: HeatmapFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  // Track expanded paths for toggleable layers
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["root"]));

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const path = node.id;
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        // Toggle off: Collapse this path and all its descendants
        for (const p of next) {
          if (p === path || p.startsWith(path + '/')) {
            next.delete(p);
          }
        }
      } else {
        // Toggle on: Expand this path and collapse siblings
        const parts = path.split('/');
        const level = parts.length;
        const parentPath = parts.slice(0, -1).join('/');

        // Remove any other expanded path at the same level sharing the same parent
        for (const p of next) {
          if (p === "root") continue;
          
          const pParts = p.split('/');
          const pLevel = pParts.length;
          const pParentPath = pParts.slice(0, -1).join('/');

          if (pLevel === level && pParentPath === parentPath) {
            // It's a sibling, remove it and all its descendants
            for (const sub of next) {
               if (sub === p || sub.startsWith(p + '/')) {
                 next.delete(sub);
               }
            }
          }
        }
        next.add(path);
      }
      return next;
    });
  }, []);

  // Transform FolderNode tree into React Flow nodes and edges
  useEffect(() => {
    if (!structure) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Spacing configuration (centered & clean)
    const HORIZONTAL_GAP = 240;
    const VERTICAL_GAP = 70;

    // Track vertical counts to center the tree
    const levelCounts: Record<number, number> = {};
    
    // Pre-traverse to calculate total height at each level for centering
    const calculateHeights = (node: FolderNode, level: number) => {
        const path = node.path || "root";
        levelCounts[level] = (levelCounts[level] || 0) + 1;
        
        if (expandedPaths.has(path)) {
            Object.values(node.children)
                .sort((a, b) => b.totalFileCount - a.totalFileCount)
                .slice(0, 15)
                .forEach(child => calculateHeights(child, level + 1));
        }
    };

    calculateHeights(structure, 0);

    // Actual traversal to place nodes
    const positionedCount: Record<number, number> = {};
    const traverse = (node: FolderNode, level: number, parentId?: string) => {
        const id = node.path || "root";
        const currentIdx = positionedCount[level] || 0;
        positionedCount[level] = currentIdx + 1;

        const isExpanded = expandedPaths.has(id);
        
        // Vertical Centering Logic:
        // Offset y by half of the total height at this level
        const totalAtThisLevel = levelCounts[level] || 1;
        const x = level * HORIZONTAL_GAP;
        const y = (currentIdx - (totalAtThisLevel - 1) / 2) * VERTICAL_GAP;

        newNodes.push({
            id,
            type: 'folderNode',
            data: { 
                label: node.name, 
                level,
                isExpanded
            },
            position: { x, y },
        });

        if (parentId) {
            newEdges.push({
                id: `e-${parentId}-${id}`,
                source: parentId,
                target: id,
                type: 'smoothstep',
                style: { 
                    stroke: 'rgba(255, 255, 255, 0.2)', 
                    strokeWidth: 1.5,
                },
                // @ts-ignore - Smoothstep uses pathOptions in certain versions/implementations
                pathOptions: {
                    borderRadius: 20,
                    offset: 30
                }
            } as any);
        }

        if (isExpanded) {
            Object.values(node.children)
                .sort((a, b) => b.totalFileCount - a.totalFileCount)
                .slice(0, 15) // Limit depth for clean view
                .forEach(child => traverse(child, level + 1, id));
        }
    };

    traverse(structure, 0);

    setNodes(newNodes);
    setEdges(newEdges);
  }, [structure, expandedPaths, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-[#030303] overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.5 }}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        panOnScroll
        selectionOnDrag
        minZoom={0.1}
        maxZoom={4}
      >
        <Background variant={BackgroundVariant.Dots} gap={32} size={0.5} color="rgba(255,255,255,0.03)" />
        
        <Panel position="top-right" className="bg-[#080808]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[11px] text-zinc-400 font-mono shadow-xl flex items-center gap-3">
           <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse" />
             <span className="text-white/90">LIVE_SYSTEM</span>
           </div>
           <div className="w-[1px] h-3 bg-white/10" />
           <span>REPO_ARCHITECTURE_v3</span>
        </Panel>
        
        {/* Simplified Premium Legend */}
        <Panel position="bottom-left" className="bg-[#050505]/95 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl mb-6 ml-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <div className="w-1 h-3 bg-white rounded-full" />
                Network Map
            </h4>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-zinc-400">
                    <div className="w-4 h-4 rounded-md bg-white" />
                    <span className="text-[12px] font-medium leading-none">Root Project</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                    <div className="w-4 h-4 rounded-md border border-white/20 bg-zinc-900" />
                    <span className="text-[12px] font-medium leading-none">Directory Module</span>
                </div>
            </div>
            <div className="pt-3 border-t border-white/5">
                <div className="text-[10px] text-zinc-500 px-3 py-1 bg-zinc-900/50 rounded-lg border border-white/5 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    Tap folder to drill down
                </div>
            </div>
        </Panel>

      </ReactFlow>
    </div>
  );
};
