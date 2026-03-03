import React, { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Environment, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Plus, Trash2, RotateCw } from 'lucide-react';

const INCHES_TO_FEET = 1 / 12;

type WallData = {
  start: [number, number];
  end: [number, number];
  height?: number;
  elevation?: number;
  thickness?: number;
  glass?: boolean;
  color?: string;
};

const WALLS: WallData[] = [
  // Top Wall (z=0)
  { start: [0, 0], end: [2, 0], thickness: 1 },
  { start: [2, 0], end: [14, 0], thickness: 1, glass: true, height: 6, elevation: 2 },
  { start: [2, 0], end: [14, 0], thickness: 1, height: 2, color: "#1f2937" },
  { start: [2, 0], end: [14, 0], thickness: 1, height: 1, elevation: 8, color: "#1f2937" },
  { start: [14, 0], end: [16, 0], thickness: 1 },
  { start: [16, 0], end: [24, 0], thickness: 1, glass: true, height: 6, elevation: 2 },
  { start: [16, 0], end: [24, 0], thickness: 1, height: 2, color: "#1f2937" },
  { start: [16, 0], end: [24, 0], thickness: 1, height: 1, elevation: 8, color: "#1f2937" },
  { start: [24, 0], end: [26.58, 0], thickness: 1 },
  { start: [26.58, 0], end: [35, 0], thickness: 1, glass: true, height: 6, elevation: 2 },
  { start: [26.58, 0], end: [35, 0], thickness: 1, height: 2, color: "#1f2937" },
  { start: [26.58, 0], end: [35, 0], thickness: 1, height: 1, elevation: 8, color: "#1f2937" },
  { start: [35, 0], end: [37.66, 0], thickness: 1 },

  // Right Wall (Bedroom Windows)
  { start: [37.66, 0], end: [37.66, 18.33], thickness: 1, glass: true, height: 6, elevation: 2 },
  { start: [37.66, 0], end: [37.66, 18.33], thickness: 1, height: 2, color: "#1f2937" },
  { start: [37.66, 0], end: [37.66, 18.33], thickness: 1, height: 1, elevation: 8, color: "#1f2937" },

  // Bottom Right Exterior
  { start: [37.66, 18.33], end: [8, 18.33], thickness: 1 },

  // Inner Corner
  { start: [8, 18.33], end: [8, 31.08], thickness: 1 },

  // Bottom Left Exterior
  { start: [8, 31.08], end: [6, 31.08], thickness: 1 },
  { start: [6, 31.08], end: [3, 31.08], thickness: 1, height: 2, elevation: 7 },
  { start: [3, 31.08], end: [0, 31.08], thickness: 1 },

  // Left Wall
  { start: [0, 31.08], end: [0, 0], thickness: 1 },

  // --- Internal Walls ---
  
  // Bathroom Top
  { start: [18.5, 4], end: [20, 4] },
  { start: [23, 4], end: [26.58, 4] },
  { start: [20, 4], end: [23, 4], height: 2, elevation: 7 },

  // Bathroom Left (Kitchen Back)
  { start: [18.5, 4], end: [18.5, 18.33] },

  // Bathroom Right (Bedroom Left)
  { start: [26.58, 4], end: [26.58, 18.33] },

  // Pantry Walls (Next to Kitchen)
  { start: [18.5, 4], end: [15.5, 4] },
  { start: [15.5, 4], end: [15.5, 5.5] },
  { start: [15.5, 5.5], end: [17, 7], height: 2, elevation: 7 }, // Pantry door gap
  { start: [17, 7], end: [18.5, 7] },

  // Bedroom Closet
  { start: [26.58, 15.91], end: [37.66, 15.91] },

  // Hallway Closets Dividers
  { start: [0, 22], end: [3, 22] },
  { start: [0, 26], end: [3, 26] },

  // Hallway Closets Front Wall
  { start: [3, 18.33], end: [3, 19] },
  { start: [3, 19], end: [3, 21.5], height: 2, elevation: 7 }, // Coat closet gap
  { start: [3, 21.5], end: [3, 23] },
  { start: [3, 23], end: [3, 25.5], height: 2, elevation: 7 }, // WH closet gap
  { start: [3, 25.5], end: [3, 27] },
  { start: [3, 27], end: [3, 30.5], height: 2, elevation: 7 }, // W/D closet gap
  { start: [3, 30.5], end: [3, 31.08] },
];

function Wall({ data }: { data: WallData }) {
  const { start, end, height = 9, elevation = 0, thickness = 0.5, glass = false, color = "#f3f4f6" } = data;
  
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  
  const cx = start[0] + dx / 2;
  const cz = start[1] + dz / 2;
  const cy = elevation + height / 2;

  return (
    <mesh 
      position={[cx, cy, cz]} 
      rotation={[0, -angle, 0]} 
      castShadow={!glass} 
      receiveShadow
    >
      <boxGeometry args={[length, height, thickness]} />
      {glass ? (
        <meshPhysicalMaterial 
          color="#88ccff" 
          transparent 
          opacity={0.3} 
          roughness={0.1} 
          transmission={0.9} 
          thickness={0.5} 
        />
      ) : (
        <meshStandardMaterial color={color} roughness={0.9} />
      )}
    </mesh>
  );
}

function ApartmentFloor() {
  const mainFloorShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(37.66, 0);
    shape.lineTo(37.66, -18.33);
    shape.lineTo(8, -18.33);
    shape.lineTo(8, -31.08);
    shape.lineTo(0, -31.08);
    shape.closePath();
    return shape;
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Stained Concrete Floor (Uniform for all rooms) */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <shapeGeometry args={[mainFloorShape]} />
        <meshStandardMaterial color="#8c8984" roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
}

function BuiltIns() {
  return (
    <group>
      {/* Kitchen Counter Main */}
      <mesh position={[17.25, 1.45, 12.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.9, 6]} />
        <meshStandardMaterial color="#2d1f1a" roughness={0.8} /> {/* Dark Wood Cabinetry */}
      </mesh>
      {/* Counter Top */}
      <mesh position={[17.25, 2.95, 12.5]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.1, 6.1]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.2} /> {/* Quartz */}
      </mesh>
      
      {/* Stove */}
      <mesh position={[17.25, 1.5, 8.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 3, 2]} />
        <meshStandardMaterial color="#1f2937" roughness={0.4} />
      </mesh>
      {/* Stove Burners */}
      <mesh position={[17.25, 3.01, 8.5]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.05, 1.8]} />
        <meshStandardMaterial color="#000000" roughness={0.8} />
      </mesh>

      {/* Sink */}
      <mesh position={[17.25, 3.01, 12.5]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.1, 2]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Faucet */}
      <mesh position={[17.8, 3.5, 12.5]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Fridge */}
      <mesh position={[17.25, 3.5, 16.75]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 7, 2.5]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Washer / Dryer */}
      <mesh position={[1.5, 1.5, 28.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 3, 2.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[1.5, 2, 28.5]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.8, 2.6]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.1} />
      </mesh>
      {/* W/D Control Panel */}
      <mesh position={[1.5, 3.3, 29.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.3} />
      </mesh>

      {/* Water Heater */}
      <mesh position={[1.5, 2.5, 24]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 3, 16]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Bathroom Shower */}
      <mesh position={[22.54, 3.5, 16.66]} castShadow receiveShadow>
        <boxGeometry args={[8.08, 7, 3.33]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.6} transmission={0.5} roughness={0.2} />
      </mesh>

      {/* Bathroom Vanity */}
      <mesh position={[25.58, 1.45, 8]} castShadow receiveShadow>
        <boxGeometry args={[2, 2.9, 4]} />
        <meshStandardMaterial color="#2d1f1a" roughness={0.8} />
      </mesh>
      <mesh position={[25.58, 2.95, 8]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.1, 4.1]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.2} />
      </mesh>
      
      {/* Toilet */}
      <mesh position={[25, 1, 13]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>
      <mesh position={[25.5, 2.5, 13]} castShadow receiveShadow>
        <boxGeometry args={[1, 2, 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>

      {/* Doors */}
      <Door position={[3, 3.5, 31.08]} rotation={[0, -Math.PI / 3, 0]} width={3} /> {/* Entrance */}
      <Door position={[23, 3.5, 4]} rotation={[0, Math.PI - Math.PI / 4, 0]} width={3} /> {/* Bathroom */}
      
      {/* Pantry Door */}
      <Door position={[16.25, 3.5, 6.25]} rotation={[0, -Math.PI / 4, 0]} width={2.1} />

      {/* Hallway Closet Doors */}
      <Door position={[3, 3.5, 20.25]} rotation={[0, Math.PI / 6, 0]} width={2.5} color="#e5e7eb" /> {/* Coat Closet */}
      <Door position={[3, 3.5, 24.25]} rotation={[0, Math.PI / 6, 0]} width={2.5} color="#e5e7eb" /> {/* Water Heater */}
      <Door position={[3, 3.5, 28.75]} rotation={[0, Math.PI / 6, 0]} width={3.5} color="#e5e7eb" /> {/* Washer/Dryer */}
    </group>
  );
}

function Door({ position, rotation, width, color = "#8b5a2b" }: { position: [number, number, number], rotation: [number, number, number], width: number, color?: string }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[width / 2, 0, 0]} castShadow>
        <boxGeometry args={[width, 7, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Measurements({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <group position={[0, 0.5, 0]}>
      {/* Top Wall Width */}
      <MeasurementLine start={[0, 0, 0.5]} end={[37.66, 0, 0.5]} text="37' 8&quot;" />
      {/* Left Wall Height */}
      <MeasurementLine start={[0.5, 0, 0]} end={[0.5, 0, 31.08]} text="31' 1&quot;" />
      {/* Living Room Width */}
      <MeasurementLine start={[0, 0, 10]} end={[16.25, 0, 10]} text="16' 3&quot;" />
      {/* Bedroom Width */}
      <MeasurementLine start={[26.58, 0, 10]} end={[37.66, 0, 10]} text="11' 1&quot;" />
      {/* Living Room Depth */}
      <MeasurementLine start={[12, 0, 0]} end={[12, 0, 18.33]} text="18' 4&quot;" />
      {/* Bedroom Depth */}
      <MeasurementLine start={[32, 0, 0]} end={[32, 0, 15.91]} text="15' 11&quot;" />
    </group>
  );
}

function MeasurementLine({ start, end, text }: { start: [number, number, number], end: [number, number, number], text: string }) {
  const mid: [number, number, number] = [(start[0] + end[0]) / 2, start[1], (start[2] + end[2]) / 2];
  const dx = end[0] - start[0];
  const dz = end[2] - start[2];
  const angle = Math.atan2(dz, dx);

  return (
    <group>
      <Line points={[start, end]} color="#ef4444" lineWidth={3} />
      <Text 
        position={mid} 
        rotation={[-Math.PI / 2, 0, angle]} 
        fontSize={1.2} 
        color="#ef4444" 
        anchorX="center" 
        anchorY="bottom"
        outlineWidth={0.05}
        outlineColor="#ffffff"
      >
        {text}
      </Text>
    </group>
  );
}

interface FurnitureItem {
  id: string;
  name: string;
  width: number; // in inches
  depth: number; // in inches
  height: number; // in inches
  color: string;
  position: [number, number, number]; // x, y, z in feet
  rotation: [number, number, number];
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function FurnitureMesh({ 
  item, 
  isSelected, 
  onSelect, 
  onUpdate 
}: { 
  item: FurnitureItem; 
  isSelected: boolean; 
  onSelect: () => void;
  onUpdate: (id: string, position: [number, number, number]) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const w = item.width * INCHES_TO_FEET;
  const h = item.height * INCHES_TO_FEET;
  const d = item.depth * INCHES_TO_FEET;

  const content = (
    <mesh 
      ref={meshRef}
      position={[item.position[0], h / 2, item.position[2]]} 
      rotation={item.rotation as any}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial 
        color={item.color} 
        roughness={0.6}
      />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color={isSelected ? 'white' : 'black'} linewidth={isSelected ? 3 : 1} />
      </lineSegments>
    </mesh>
  );

  if (isSelected) {
    return (
      <TransformControls 
        object={meshRef as any} 
        mode="translate"
        showY={false}
        onObjectChange={() => {
          if (meshRef.current) {
            onUpdate(item.id, [
              meshRef.current.position.x,
              item.position[1],
              meshRef.current.position.z
            ]);
          }
        }}
      >
        {content}
      </TransformControls>
    );
  }

  return content;
}

export default function App() {
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);

  const [name, setName] = useState('Sofa');
  const [width, setWidth] = useState('80');
  const [depth, setWidth2] = useState('36');
  const [height, setHeight] = useState('32');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: FurnitureItem = {
      id: Date.now().toString(),
      name,
      width: parseFloat(width) || 24,
      depth: parseFloat(depth) || 24,
      height: parseFloat(height) || 24,
      color: COLORS[items.length % COLORS.length],
      position: [8, 0, 9], // Spawn in the living room
      rotation: [0, 0, 0]
    };
    setItems([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const updateItemPosition = (id: string, position: [number, number, number]) => {
    setItems(items.map(it => it.id === id ? { ...it, position } : it));
  };

  const rotateItem = (id: string) => {
    setItems(items.map(it => {
      if (it.id === id) {
        return {
          ...it,
          rotation: [it.rotation[0], it.rotation[1] - Math.PI / 2, it.rotation[2]]
        };
      }
      return it;
    }));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="w-full h-screen flex bg-neutral-900 text-white font-sans overflow-hidden">
      <div className="w-80 bg-neutral-800 border-r border-neutral-700 flex flex-col shadow-xl z-10 relative">
        <div className="p-6 border-b border-neutral-700">
          <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            CAD Apartment 3D
          </h1>
          <p className="text-sm text-neutral-400">Design your perfect layout</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">View Options</h2>
            <button 
              onClick={() => setShowMeasurements(!showMeasurements)}
              className={`w-full font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${showMeasurements ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-300'}`}
            >
              {showMeasurements ? 'Hide Dimensions & Grid' : 'Show Dimensions & Grid'}
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">Add Furniture</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Item Name</label>
                <input 
                  type="text" 
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">W (in)</label>
                  <input 
                    type="number" 
                    value={width} onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">D (in)</label>
                  <input 
                    type="number" 
                    value={depth} onChange={(e) => setWidth2(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">H (in)</label>
                  <input 
                    type="number" 
                    value={height} onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add to Room
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">Room Inventory</h2>
            {items.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">No items added yet.</p>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${selectedId === item.id ? 'bg-blue-900/40 border border-blue-500/50' : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700'}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-sm font-medium text-neutral-200">{item.name}</p>
                        <p className="text-xs text-neutral-500">{item.width}"W × {item.depth}"D × {item.height}"H</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); rotateItem(item.id); }}
                        className="text-neutral-500 hover:text-blue-400 p-1"
                        title="Rotate 90 degrees"
                      >
                        <RotateCw size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                        className="text-neutral-500 hover:text-red-400 p-1"
                        title="Delete item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative" onClick={() => setSelectedId(null)}>
        <Canvas shadows camera={{ position: [18, 25, 35], fov: 50 }}>
          <color attach="background" args={['#171717']} />
          <ambientLight intensity={1.5} />
          <directionalLight 
            position={[10, 30, 20]} 
            intensity={0.5} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048} 
            shadow-bias={-0.0005}
          />
          <Environment preset="city" environmentIntensity={1.5} />
          
          {showMeasurements && (
            <Grid 
              position={[18, -0.01, 15]}
              args={[60, 60]} 
              cellSize={1}
              cellThickness={1} 
              cellColor="#404040" 
              sectionSize={5} 
              sectionThickness={1.5} 
              sectionColor="#6b7280" 
              fadeDistance={50} 
              fadeStrength={1} 
            />
          )}

          <Measurements visible={showMeasurements} />

          <ApartmentFloor />
          <BuiltIns />

          {WALLS.map((wall, i) => (
            <Wall key={i} data={wall} />
          ))}

          {items.map(item => (
            <FurnitureMesh 
              key={item.id} 
              item={item} 
              isSelected={selectedId === item.id}
              onSelect={() => setSelectedId(item.id)}
              onUpdate={updateItemPosition}
            />
          ))}

          <OrbitControls makeDefault target={[18, 0, 15]} minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.1} />
        </Canvas>
        
        <div className="absolute top-4 left-4 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 p-3 rounded-lg pointer-events-none">
          <p className="text-sm text-neutral-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            Drag items to move
          </p>
          <p className="text-sm text-neutral-300 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Left click + drag to rotate camera
          </p>
        </div>
      </div>
    </div>
  );
}
