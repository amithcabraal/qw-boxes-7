import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Box, Player, GameStatus } from '../types/game';
import { Monitor, User } from 'lucide-react';

interface GameGridProps {
  size: number;
  lines: Line[];
  boxes: Box[];
  status: GameStatus;
  onLineClick: (row: number, col: number, isHorizontal: boolean) => void;
  isLandscape: boolean;
}

export const GameGrid: React.FC<GameGridProps> = ({
  size,
  lines,
  boxes,
  status,
  onLineClick,
  isLandscape,
}) => {
  const [gridSize, setGridSize] = useState(0);

  useEffect(() => {
    const updateGridSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 32; // 16px padding on each side
      const menuHeight = 64; // MenuBar height
      
      let maxSize;
      if (isLandscape) {
        // In landscape, we use the right half of the screen
        const availableWidth = (viewportWidth / 2) - padding;
        const availableHeight = viewportHeight - menuHeight - padding;
        maxSize = Math.min(availableWidth, availableHeight, 600);
      } else {
        // In portrait, we use the previous calculation
        const controlsHeight = 200; // Approximate height for controls, scoreboard, etc.
        const availableWidth = viewportWidth - padding;
        const availableHeight = viewportHeight - menuHeight - controlsHeight;
        maxSize = Math.min(availableWidth, availableHeight, 400);
      }
      
      setGridSize(maxSize);
    };

    updateGridSize();
    window.addEventListener('resize', updateGridSize);
    return () => window.removeEventListener('resize', updateGridSize);
  }, [isLandscape]);

  const spacing = gridSize / (size - 1);
  const dotSize = Math.max(6, gridSize * 0.03); // Scale dot size with grid
  const lineThickness = Math.max(4, gridSize * 0.02); // Scale line thickness with grid

  const getLineColor = (line?: Line) => {
    if (!line) return 'bg-gray-700 hover:bg-gray-600';
    const baseColor = line.player === 1 ? 'bg-emerald-500' : 'bg-blue-400';
    return line.isLastPlayed ? `${baseColor} animate-pulse` : baseColor;
  };

  const getBoxStyles = (owner?: Player) => {
    if (!owner) return 'bg-transparent';
    return owner === 1 ? 'bg-emerald-500/30' : 'bg-blue-400/30';
  };

  const BoxIcon = ({ owner }: { owner: Player }) => {
    const isPlayer1 = owner === 1;
    const Icon = isPlayer1 ? User : Monitor;
    return (
      <Icon
        size={spacing * 0.4}
        className={`${isPlayer1 ? 'text-emerald-800' : 'text-blue-600'}`}
      />
    );
  };

  if (!gridSize) return null;

  return (
    <div className="relative" style={{ width: gridSize, height: gridSize }}>
      {/* Boxes */}
      <AnimatePresence>
        {boxes.map((box) => (
          <motion.div
            key={`box-${box.row}-${box.col}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute flex items-center justify-center ${getBoxStyles(box.owner)}`}
            style={{
              left: box.col * spacing,
              top: box.row * spacing,
              width: spacing,
              height: spacing,
              borderRadius: '4px',
            }}
          >
            {box.owner && <BoxIcon owner={box.owner} />}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Horizontal lines */}
      {Array.from({ length: size }, (_, row) =>
        Array.from({ length: size - 1 }, (_, col) => {
          const line = lines.find(l => l.row === row && l.col === col && l.isHorizontal);
          const placed = !!line;
          
          return (
            <motion.button
              key={`h-${row}-${col}`}
              className={`absolute ${getLineColor(line)} rounded-full transition-colors duration-150`}
              style={{
                left: col * spacing + dotSize / 2,
                top: row * spacing,
                width: spacing - dotSize,
                height: lineThickness,
                cursor: status === 'playing' && !placed ? 'pointer' : 'default',
              }}
              disabled={status !== 'playing' || placed}
              onClick={() => onLineClick(row, col, true)}
              whileHover={status === 'playing' && !placed ? { scale: 1.1 } : {}}
              whileTap={status === 'playing' && !placed ? { scale: 0.95 } : {}}
            />
          );
        })
      )}

      {/* Vertical lines */}
      {Array.from({ length: size - 1 }, (_, row) =>
        Array.from({ length: size }, (_, col) => {
          const line = lines.find(l => l.row === row && l.col === col && !l.isHorizontal);
          const placed = !!line;
          
          return (
            <motion.button
              key={`v-${row}-${col}`}
              className={`absolute ${getLineColor(line)} rounded-full transition-colors duration-150`}
              style={{
                left: col * spacing,
                top: row * spacing + dotSize / 2,
                width: lineThickness,
                height: spacing - dotSize,
                cursor: status === 'playing' && !placed ? 'pointer' : 'default',
              }}
              disabled={status !== 'playing' || placed}
              onClick={() => onLineClick(row, col, false)}
              whileHover={status === 'playing' && !placed ? { scale: 1.1 } : {}}
              whileTap={status === 'playing' && !placed ? { scale: 0.95 } : {}}
            />
          );
        })
      )}

      {/* Dots */}
      {Array.from({ length: size }, (_, row) =>
        Array.from({ length: size }, (_, col) => (
          <div
            key={`dot-${row}-${col}`}
            className="absolute bg-white rounded-full"
            style={{
              left: col * spacing,
              top: row * spacing,
              width: dotSize,
              height: dotSize,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))
      )}
    </div>
  );
};