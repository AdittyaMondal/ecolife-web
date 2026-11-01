'use client';

import * as React from 'react';
import {
  drawFenceTile,
  drawGardener,
  drawGrassTile,
  drawPathTile,
  drawTreeSprite,
  drawWaterTile,
  TILE_SIZE,
} from '@/components/blocks/garden/pixel-sprites';
import { getTreeBySlug } from '@/lib/tree-catalogue';
import type { GardenState, PlantedTree } from '@/types/trees';

export interface GardenCanvasProps {
  state: GardenState;
  movingTreeFrom: { x: number; y: number } | null;
  onTileClick: (x: number, y: number) => void;
  onMovePlayer: (dx: number, dy: number, dir: 'up' | 'down' | 'left' | 'right') => void;
  onActionPlant: () => void;
  onActionRemove: () => void;
  onActionWater: () => void;
  onActionMove: () => void;
  onSelectHotbar: (idx: number) => void;
  activeTool: 'plant' | 'water' | 'remove' | 'move';
}

export function GardenCanvas({
  state,
  movingTreeFrom,
  onTileClick,
  onMovePlayer,
  onActionPlant,
  onActionRemove,
  onActionWater,
  onActionMove,
  onSelectHotbar,
  activeTool,
}: GardenCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [hoveredTile, setHoveredTile] = React.useState<{ x: number; y: number } | null>(null);
  const [isWalking, setIsWalking] = React.useState(false);
  const [inspectedTree, setInspectedTree] = React.useState<PlantedTree | null>(null);

  const totalWidth = state.gridCols * TILE_SIZE;
  const totalHeight = state.gridRows * TILE_SIZE;

  // Keyboard navigation & actions
  React.useEffect(() => {
    let walkTimer: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      setIsWalking(true);
      if (walkTimer) clearTimeout(walkTimer);
      walkTimer = setTimeout(() => setIsWalking(false), 200);

      switch (e.key) {
        // Movement: WASD or Arrow Keys
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onMovePlayer(0, -1, 'up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onMovePlayer(0, 1, 'down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onMovePlayer(-1, 0, 'left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onMovePlayer(1, 0, 'right');
          break;

        // Hotbar shortcuts 1..6
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          e.preventDefault();
          onSelectHotbar(Number(e.key) - 1);
          break;

        // Actions
        case ' ':
        case 'e':
        case 'E':
        case 'Enter':
          e.preventDefault();
          if (activeTool === 'remove') {
            onActionRemove();
          } else if (activeTool === 'water') {
            onActionWater();
          } else if (activeTool === 'move') {
            onActionMove();
          } else {
            onActionPlant();
          }
          break;

        case 'r':
        case 'R':
        case 'Backspace':
          e.preventDefault();
          onActionRemove();
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          onActionMove();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (walkTimer) clearTimeout(walkTimer);
    };
  }, [
    onMovePlayer,
    onSelectHotbar,
    onActionPlant,
    onActionRemove,
    onActionWater,
    onActionMove,
    activeTool,
  ]);

  // Main 60FPS Game Loop Render Cycle
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let tick = 0;

    const render = () => {
      tick++;

      // Clear & enforce crisp nearest-neighbor pixel rendering
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, totalWidth, totalHeight);

      // 1. Draw Terrain Grid (Background)
      for (let r = 0; r < state.gridRows; r++) {
        for (let c = 0; c < state.gridCols; c++) {
          const px = c * TILE_SIZE;
          const py = r * TILE_SIZE;
          const seed = c * 31 + r * 17;

          // Perimeter Fence
          if (r === 0 || r === state.gridRows - 1 || c === 0 || c === state.gridCols - 1) {
            drawFenceTile(ctx, px, py);
          }
          // Garden Cobblestone Pathway: horizontal path on row 5 and vertical path on col 7
          else if (r === 5 || (c === 7 && r < 7)) {
            drawPathTile(ctx, px, py, seed);
          }
          // Garden Pond at (7, 7) and (8, 7)
          else if ((c === 7 || c === 8) && (r === 7 || r === 8)) {
            drawWaterTile(ctx, px, py, tick, c === 7 && r === 7);
          }
          // Lush Green Meadow Grass
          else {
            drawGrassTile(ctx, px, py, seed);
          }
        }
      }

      // 2. Draw Moving Tree Target Halo if in relocate mode
      if (movingTreeFrom) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          movingTreeFrom.x * TILE_SIZE + 2,
          movingTreeFrom.y * TILE_SIZE + 2,
          TILE_SIZE - 4,
          TILE_SIZE - 4,
        );
      }

      // 3. Draw Selected / Hovered Tile Cursor Indicator
      if (hoveredTile) {
        const { x, y } = hoveredTile;
        const isHoverInBounds =
          x > 0 &&
          x < state.gridCols - 1 &&
          y > 0 &&
          y < state.gridRows - 1 &&
          !((x === 7 || x === 8) && (y === 7 || y === 8));

        ctx.strokeStyle = isHoverInBounds ? '#7EBF52' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.setLineDash([]);

        // Ghost Tree Preview on hovered empty tile if plant tool is active
        const equippedSlug = state.hotbar[state.activeHotbarIndex];
        const isOccupied = state.plantedTrees.some((t) => t.x === x && t.y === y);
        if (activeTool === 'plant' && equippedSlug && isHoverInBounds && !isOccupied) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          drawTreeSprite(ctx, x * TILE_SIZE, y * TILE_SIZE, equippedSlug, 2, tick);
          ctx.restore();
        }
      }

      // 4. Draw Tile in front of player (action target cursor)
      const { x: px, y: py, direction } = state.playerPos;
      let targetX = px;
      let targetY = py;
      if (direction === 'up') targetY -= 1;
      if (direction === 'down') targetY += 1;
      if (direction === 'left') targetX -= 1;
      if (direction === 'right') targetX += 1;

      if (targetX >= 0 && targetX < state.gridCols && targetY >= 0 && targetY < state.gridRows) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
          targetX * TILE_SIZE + 4,
          targetY * TILE_SIZE + 4,
          TILE_SIZE - 8,
          TILE_SIZE - 8,
        );
      }

      // 5. Draw Planted Trees & Player with Y-Sorting (Depth Buffering)
      // Objects with lower Y render first; objects with higher Y render in front!
      const renderEntities: Array<{
        type: 'tree' | 'player';
        y: number;
        tree?: PlantedTree;
      }> = [
        ...state.plantedTrees.map((tree) => ({ type: 'tree' as const, y: tree.y, tree })),
        { type: 'player' as const, y: state.playerPos.y },
      ];

      renderEntities.sort((a, b) => a.y - b.y);

      for (const entity of renderEntities) {
        if (entity.type === 'player') {
          drawGardener(
            ctx,
            state.playerPos.x * TILE_SIZE,
            state.playerPos.y * TILE_SIZE,
            state.playerPos.direction,
            isWalking,
            tick,
          );
        } else if (entity.tree) {
          drawTreeSprite(
            ctx,
            entity.tree.x * TILE_SIZE,
            entity.tree.y * TILE_SIZE,
            entity.tree.treeSlug,
            entity.tree.growthStage,
            tick,
          );
        }
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [state, hoveredTile, isWalking, movingTreeFrom, activeTool, totalWidth, totalHeight]);

  // Handle Mouse Hover for tile selection and tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    if (tileX >= 0 && tileX < state.gridCols && tileY >= 0 && tileY < state.gridRows) {
      setHoveredTile({ x: tileX, y: tileY });

      // Check if hovering over a planted tree to inspect
      const tree = state.plantedTrees.find((t) => t.x === tileX && t.y === tileY);
      setInspectedTree(tree || null);
    } else {
      setHoveredTile(null);
      setInspectedTree(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredTile(null);
    setInspectedTree(null);
  };

  // Click on tile to interact/walk/plant
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    if (tileX >= 0 && tileX < state.gridCols && tileY >= 0 && tileY < state.gridRows) {
      onTileClick(tileX, tileY);
    }
  };

  const inspectedTreeDef = inspectedTree ? getTreeBySlug(inspectedTree.treeSlug) : null;

  return (
    <div className="relative flex flex-col items-center select-none overflow-hidden rounded-xl border-4 border-emerald-950/80 bg-[#4e7d32] shadow-2xl p-2 sm:p-3">
      {/* Floating Retro Inspection Tooltip */}
      {inspectedTree && inspectedTreeDef && (
        <div className="pointer-events-none absolute top-4 left-4 z-20 flex items-center gap-2.5 rounded-sm border-2 border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-md animate-fade-in">
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: inspectedTreeDef.rarity.color }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-foreground">
                {inspectedTreeDef.name}
              </span>
              <span
                className="rounded-xs px-1.5 py-0.2 text-[10px] font-bold text-white uppercase"
                style={{ backgroundColor: inspectedTreeDef.rarity.color }}
              >
                {inspectedTreeDef.rarity.name}
              </span>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">
              +{inspectedTreeDef.co2OffsetKgPerYear} kg CO₂e/yr · Stage {inspectedTree.growthStage}
              /4
            </p>
          </div>
        </div>
      )}

      {/* Relocate Mode Active Banner */}
      {movingTreeFrom && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-sm border-2 border-amber-500 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-md">
          <span>Relocate Mode: Click any empty meadow tile to drop tree</span>
        </div>
      )}

      {/* The Game Canvas */}
      <canvas
        ref={canvasRef}
        width={totalWidth}
        height={totalHeight}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-crosshair max-w-full rounded-md shadow-inner transition-transform"
        style={{
          imageRendering: 'pixelated',
          aspectRatio: `${totalWidth} / ${totalHeight}`,
        }}
      />
    </div>
  );
}
