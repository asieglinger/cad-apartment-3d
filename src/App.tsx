import React, { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Environment, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Plus, Trash2, RotateCw, ArrowDownToLine, Truck, Home } from 'lucide-react';

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

// ... Apartment Data ...
const WALLS: WallData[] = [
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
  { start: [37.66, 0], end: [37.66, 18.33], thickness: 1, glass: true, height: 6, elevation: 2 },
  { start: [37.66, 0], end: [37.66, 18.33], thickness: 1, height: 2, color: "#1f2937" },
  { start: [37.66, 0], end: [37.66, 18.33], thickness: 1, height: 1, elevation: 8, color: "#1f2937" },
  { start: [37.66, 18.33], end: [8, 18.33], thickness: 1 },
  { start: [8, 18.33], end: [8, 31.08], thickness: 1 },
  { start: [8, 31.08], end: [6, 31.08], thickness: 1 },
  { start: [6, 31.08], end: [3, 31.08], thickness: 1, height: 2, elevation: 7 },
  { start: [3, 31.08], end: [0, 31.08], thickness: 1 },
  { start: [0, 31.08], end: [0, 0], thickness: 1 },
  { start: [18.5, 4], end: [20, 4] },
  { start: [23, 4], end: [26.58, 4] },
  { start: [20, 4], end: [23, 4], height: 2, elevation: 7 },
  { start: [18.5, 4], end: [18.5, 18.33] },
  { start: [26.58, 4], end: [26.58, 18.33] },
  { start: [18.5, 4], end: [15.5, 4] },
  { start: [15.5, 4], end: [15.5, 7] },
  { start: [15.5, 7], end: [17.6, 7], height: 2, elevation: 7 },
  { start: [17.6, 7], end: [18.5, 7] },
  { start: [26.58, 15.91], end: [37.66, 15.91] },
  { start: [0, 22], end: [3, 22] },
  { start: [0, 26], end: [3, 26] },
  { start: [3, 18.33], end: [3, 19] },
  { start: [3, 19], end: [3, 21.5], height: 2, elevation: 7 },
  { start: [3, 21.5], end: [3, 23] },
  { start: [3, 23], end: [3, 25.5], height: 2, elevation: 7 },
  { start: [3, 25.5], end: [3, 27] },
  { start: [3, 27], end: [3, 30.5], height: 2, elevation: 7 },
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
    <mesh position={[cx, cy, cz]} rotation={[0, -angle, 0]} castShadow={!glass} receiveShadow>
      <boxGeometry args={[length, height, thickness]} />
      {glass ? (
        <meshPhysicalMaterial color="#88ccff" transparent opacity={0.3} roughness={0.1} transmission={0.9} thickness={0.5} />
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
      <mesh position={[17.25, 1.45, 12.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.9, 6]} />
        <meshStandardMaterial color="#2d1f1a" roughness={0.8} />
      </mesh>
      <mesh position={[17.25, 2.95, 12.5]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.1, 6.1]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.2} />
      </mesh>
      <mesh position={[17.25, 1.5, 8.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 3, 2]} />
        <meshStandardMaterial color="#1f2937" roughness={0.4} />
      </mesh>
      <mesh position={[17.25, 3.01, 8.5]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.05, 1.8]} />
        <meshStandardMaterial color="#000000" roughness={0.8} />
      </mesh>
      <mesh position={[17.25, 3.01, 12.5]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.1, 2]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.1} metalness={0.8} />
      </mesh>
      <mesh position={[17.8, 3.5, 12.5]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.1} metalness={0.8} />
      </mesh>
      <mesh position={[17.25, 3.5, 16.75]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 7, 2.5]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[1.5, 1.5, 28.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 3, 2.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[1.5, 2, 28.5]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.8, 2.6]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.1} />
      </mesh>
      <mesh position={[1.5, 3.3, 29.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.3} />
      </mesh>
      <mesh position={[1.5, 2.5, 24]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 3, 16]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[22.54, 3.5, 16.66]} castShadow receiveShadow>
        <boxGeometry args={[8.08, 7, 3.33]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.6} transmission={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[25.58, 1.45, 8]} castShadow receiveShadow>
        <boxGeometry args={[2, 2.9, 4]} />
        <meshStandardMaterial color="#2d1f1a" roughness={0.8} />
      </mesh>
      <mesh position={[25.58, 2.95, 8]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.1, 4.1]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.2} />
      </mesh>
      <mesh position={[25, 1, 13]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>
      <mesh position={[25.5, 2.5, 13]} castShadow receiveShadow>
        <boxGeometry args={[1, 2, 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>

      <Door position={[3, 3.5, 31.08]} rotation={[0, 0, 0]} width={3} />
      <Door position={[20, 3.5, 4]} rotation={[0, 0, 0]} width={3} />
      <Door position={[15.5, 3.5, 7]} rotation={[0, 0, 0]} width={2.1} />
      <Door position={[3, 3.5, 19]} rotation={[0, Math.PI / 2, 0]} width={2.5} color="#e5e7eb" />
      <Door position={[3, 3.5, 23]} rotation={[0, Math.PI / 2, 0]} width={2.5} color="#e5e7eb" />
      <Door position={[3, 3.5, 27]} rotation={[0, Math.PI / 2, 0]} width={3.5} color="#e5e7eb" />
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

// ... U-Haul Specifics ...
function UhaulTrailer() {
  const width = 5;
  const length = 8;
  const height = 5.5; // typical internal height for a 5x8 trailer
  const thickness = 0.2;

  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh receiveShadow position={[width/2, -thickness/2, length/2]}>
        <boxGeometry args={[width, thickness, length]} />
        <meshStandardMaterial color="#6b7280" roughness={0.8} /> {/* Dark metal/wood floor */}
      </mesh>

      {/* Front Wall */}
      <mesh castShadow receiveShadow position={[width/2, height/2, -thickness/2]}>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} /> 
      </mesh>

      {/* Left Wall */}
      <mesh castShadow receiveShadow position={[-thickness/2, height/2, length/2]}>
        <boxGeometry args={[thickness, height, length]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>

      {/* Right Wall */}
      <mesh castShadow receiveShadow position={[width + thickness/2, height/2, length/2]}>
        <boxGeometry args={[thickness, height, length]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>

      {/* Decals / Accents */}
      <mesh position={[width/2, height/2, -thickness]}>
         <boxGeometry args={[width, 1, 0.05]} />
         <meshStandardMaterial color="#f97316" roughness={0.6} /> {/* U-Haul orange stripe */}
      </mesh>
    </group>
  );
}

// ... Measurements ...
function Measurements({ visible, mode }: { visible: boolean, mode: 'apartment' | 'uhaul' }) {
  if (!visible) return null;
  
  if (mode === 'uhaul') {
    return (
      <group position={[0, 0.5, 0]}>
        <MeasurementLine start={[0, 0, 0]} end={[5, 0, 0]} text="5'" />
        <MeasurementLine start={[0, 0, 0]} end={[0, 0, 8]} text="8'" />
        <MeasurementLine start={[5, 0, 0]} end={[5, 5.5, 0]} text="5' 6&quot; Height" />
      </group>
    );
  }

  return (
    <group position={[0, 0.5, 0]}>
      <MeasurementLine start={[0, 0, 0.5]} end={[37.66, 0, 0.5]} text="37' 8&quot;" />
      <MeasurementLine start={[0.5, 0, 0]} end={[0.5, 0, 31.08]} text="31' 1&quot;" />
      <MeasurementLine start={[0, 0, 10]} end={[16.25, 0, 10]} text="16' 3&quot;" />
      <MeasurementLine start={[26.58, 0, 10]} end={[37.66, 0, 10]} text="11' 1&quot;" />
      <MeasurementLine start={[12, 0, 0]} end={[12, 0, 18.33]} text="18' 4&quot;" />
      <MeasurementLine start={[32, 0, 0]} end={[32, 0, 15.91]} text="15' 11&quot;" />
    </group>
  );
}

function MeasurementLine({ start, end, text }: { start: [number, number, number], end: [number, number, number], text: string }) {
  const mid: [number, number, number] = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dz = end[2] - start[2];
  const angle = Math.atan2(dz, dx);
  
  const rotAngle = dy > 0 ? 0 : angle;
  const rotZ = dy > 0 ? Math.PI / 2 : 0;

  return (
    <group>
      <Line points={[start, end]} color="#ef4444" lineWidth={3} />
      <Text 
        position={mid} 
        rotation={[-Math.PI / 2 + rotZ, 0, rotAngle]} 
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

// ... Items ...
interface FurnitureItem {
  id: string;
  name: string;
  width: number;
  depth: number;
  height: number;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const APT_PRESETS = [
  { name: 'Couch', w: '84', d: '36', h: '32' },
  { name: 'Sectional Couch', w: '108', d: '84', h: '32' },
  { name: 'Desk', w: '48', d: '24', h: '30' },
  { name: 'Chair', w: '24', d: '24', h: '32' },
  { name: 'King Bed', w: '76', d: '80', h: '24' },
  { name: 'Queen Bed', w: '60', d: '80', h: '24' },
  { name: 'Twin Bed', w: '38', d: '75', h: '24' },
  { name: 'Nightstand', w: '24', d: '18', h: '24' },
  { name: 'Bookshelf', w: '36', d: '12', h: '72' },
  { name: 'Dresser', w: '60', d: '20', h: '36' },
  { name: 'Custom', w: '24', d: '24', h: '24' },
];

const UHAUL_PRESETS = [
  { name: 'Small Box', w: '16', d: '12', h: '12' },
  { name: 'Medium Box', w: '18', d: '18', h: '16' },
  { name: 'Large Box', w: '18', d: '18', h: '24' },
  { name: 'Wardrobe Box', w: '24', d: '24', h: '40' },
  { name: 'Sofa', w: '84', d: '36', h: '32' },
  { name: 'Loveseat', w: '60', d: '36', h: '32' },
  { name: 'Twin Mattress', w: '38', d: '75', h: '10' },
  { name: 'Queen Mattress', w: '60', d: '80', h: '10' },
  { name: 'King Mattress', w: '76', d: '80', h: '10' },
  { name: 'Dresser', w: '60', d: '20', h: '36' },
  { name: 'Desk', w: '48', d: '24', h: '30' },
];

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

  return (
    <>
      <mesh 
        ref={meshRef}
        position={item.position} 
        rotation={item.rotation as any}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={item.color} roughness={0.6} />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
          <lineBasicMaterial color={isSelected ? 'white' : 'black'} linewidth={isSelected ? 3 : 1} />
        </lineSegments>
      </mesh>
      
      {isSelected && (
        <TransformControls 
          object={meshRef as any} 
          mode="translate"
          showY={true}
          translationSnap={0.25} // Snap translation every 3 inches
          onObjectChange={() => {
            if (meshRef.current) {
              onUpdate(item.id, [
                meshRef.current.position.x,
                meshRef.current.position.y,
                meshRef.current.position.z
              ]);
            }
          }}
        />
      )}
    </>
  );
}

export default function App() {
  const [mode, setMode] = useState<'apartment' | 'uhaul'>('uhaul');
  const [aptItems, setAptItems] = useState<FurnitureItem[]>([]);
  const [uhaulItems, setUhaulItems] = useState<FurnitureItem[]>([]);
  
  const items = mode === 'apartment' ? aptItems : uhaulItems;
  const setItems = mode === 'apartment' ? setAptItems : setUhaulItems;
  const PRESETS = mode === 'apartment' ? APT_PRESETS : UHAUL_PRESETS;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);

  const [preset, setPreset] = useState(PRESETS[0].name);
  const [name, setName] = useState(PRESETS[0].name);
  const [width, setWidth] = useState(PRESETS[0].w);
  const [depth, setWidth2] = useState(PRESETS[0].d);
  const [height, setHeight] = useState(PRESETS[0].h);

  React.useEffect(() => {
    const p = PRESETS[0];
    setPreset(p.name);
    setName(p.name);
    setWidth(p.w);
    setWidth2(p.d);
    setHeight(p.h);
    setSelectedId(null);
  }, [mode]);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPreset(val);
    const p = PRESETS.find(p => p.name === val);
    if (p) {
      setName(p.name);
      setWidth(p.w);
      setWidth2(p.d);
      setHeight(p.h);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const h = (parseFloat(height) || 24) * INCHES_TO_FEET;
    
    const defaultPos: [number, number, number] = mode === 'apartment' 
      ? [8, h / 2, 9] 
      : [2.5, h / 2, 4];

    const newItem: FurnitureItem = {
      id: Date.now().toString(),
      name,
      width: parseFloat(width) || 24,
      depth: parseFloat(depth) || 24,
      height: parseFloat(height) || 24,
      color: COLORS[items.length % COLORS.length],
      position: defaultPos,
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

  const snapToSurface = (id: string) => {
    const itemToSnap = items.find(it => it.id === id);
    if (!itemToSnap) return;

    const w1 = itemToSnap.width * INCHES_TO_FEET;
    const d1 = itemToSnap.depth * INCHES_TO_FEET;
    const h1 = itemToSnap.height * INCHES_TO_FEET;
    const isRotated1 = Math.abs(itemToSnap.rotation[1] % Math.PI) > 0.1; 
    const aw1 = isRotated1 ? d1 : w1;
    const ad1 = isRotated1 ? w1 : d1;
    
    const x1 = itemToSnap.position[0];
    const z1 = itemToSnap.position[2];

    const minX1 = x1 - aw1 / 2;
    const maxX1 = x1 + aw1 / 2;
    const minZ1 = z1 - ad1 / 2;
    const maxZ1 = z1 + ad1 / 2;

    let maxY = 0;

    items.forEach(other => {
      if (other.id === id) return;
      
      const w2 = other.width * INCHES_TO_FEET;
      const d2 = other.depth * INCHES_TO_FEET;
      const h2 = other.height * INCHES_TO_FEET;
      const isRotated2 = Math.abs(other.rotation[1] % Math.PI) > 0.1;
      const aw2 = isRotated2 ? d2 : w2;
      const ad2 = isRotated2 ? w2 : d2;

      const x2 = other.position[0];
      const z2 = other.position[2];

      const minX2 = x2 - aw2 / 2;
      const maxX2 = x2 + aw2 / 2;
      const minZ2 = z2 - ad2 / 2;
      const maxZ2 = z2 + ad2 / 2;

      const overlapX = minX1 < maxX2 && maxX1 > minX2;
      const overlapZ = minZ1 < maxZ2 && maxZ1 > minZ2;

      if (overlapX && overlapZ) {
        const otherTop = other.position[1] + h2 / 2;
        if (otherTop > maxY && otherTop <= itemToSnap.position[1] + 0.1) {
          maxY = otherTop;
        } else if (otherTop > maxY) {
           maxY = otherTop;
        }
      }
    });

    const newY = maxY + h1 / 2;
    setItems(items.map(it => it.id === id ? { ...it, position: [it.position[0], newY, it.position[2]] } : it));
  };

  return (
    <div className="w-full h-screen flex bg-neutral-900 text-white font-sans overflow-hidden">
      <div className="w-80 bg-neutral-800 border-r border-neutral-700 flex flex-col shadow-xl z-10 relative">
        <div className="p-6 border-b border-neutral-700">
          <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            {mode === 'apartment' ? 'CAD Apartment 3D' : "Bubba's Uhaul Explorer"}
          </h1>
          <p className="text-sm text-neutral-400">
            {mode === 'apartment' ? 'Design your perfect layout' : 'Pack the 5x8 trailer efficiently'}
          </p>
        </div>

        <div className="p-4 border-b border-neutral-700 flex gap-2">
          <button 
            onClick={() => setMode('uhaul')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${mode === 'uhaul' ? 'bg-orange-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-700'}`}
          >
            <Truck size={16} /> U-Haul
          </button>
          <button 
            onClick={() => setMode('apartment')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${mode === 'apartment' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-700'}`}
          >
            <Home size={16} /> Home
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">View Options</h2>
            <button 
              onClick={() => setShowMeasurements(!showMeasurements)}
              className={`w-full font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${showMeasurements ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-300'}`}
            >
              {showMeasurements ? 'Hide Dimensions' : 'Show Dimensions'}
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">Add Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Preset</label>
                <select 
                  value={preset} 
                  onChange={handlePresetChange}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                >
                  {PRESETS.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Item Name</label>
                <input 
                  type="text" 
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">W (in)</label>
                  <input 
                    type="number" 
                    value={width} onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">D (in)</label>
                  <input 
                    type="number" 
                    value={depth} onChange={(e) => setWidth2(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">H (in)</label>
                  <input 
                    type="number" 
                    value={height} onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className={`w-full font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 text-white ${mode === 'uhaul' ? 'bg-orange-600 hover:bg-orange-500' : 'bg-blue-600 hover:bg-blue-500'}`}
              >
                <Plus size={16} /> Add Item
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">Inventory</h2>
            {items.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">No items added yet.</p>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={`flex flex-col p-3 rounded-md cursor-pointer transition-colors ${selectedId === item.id ? 'bg-blue-900/40 border border-blue-500/50' : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700'}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="text-sm font-medium text-neutral-200">{item.name}</p>
                          <p className="text-xs text-neutral-500">{item.width}"W × {item.depth}"D × {item.height}"H</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                          className="text-neutral-500 hover:text-red-400 p-1"
                          title="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {selectedId === item.id && (
                      <div className="flex gap-2 mt-1 pt-2 border-t border-neutral-700">
                        <button
                           onClick={(e) => { e.stopPropagation(); rotateItem(item.id); }}
                           className="flex-1 flex items-center justify-center gap-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-1 rounded"
                        >
                          <RotateCw size={12} /> Rotate
                        </button>
                        <button
                           onClick={(e) => { e.stopPropagation(); snapToSurface(item.id); }}
                           className="flex-1 flex items-center justify-center gap-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-1 rounded"
                           title="Drop item to rest on the surface below it"
                        >
                          <ArrowDownToLine size={12} /> Stack Down
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative" onClick={() => setSelectedId(null)}>
        <Canvas shadows camera={mode === 'apartment' ? { position: [18, 25, 35], fov: 50 } : { position: [10, 8, 12], fov: 50 }}>
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
          
          <Measurements visible={showMeasurements} mode={mode} />

          {mode === 'apartment' && (
            <>
              {showMeasurements && (
                <Grid position={[18, -0.01, 15]} args={[60, 60]} cellSize={1} cellThickness={1} cellColor="#404040" sectionSize={5} sectionThickness={1.5} sectionColor="#6b7280" fadeDistance={50} fadeStrength={1} />
              )}
              <ApartmentFloor />
              <BuiltIns />
              {WALLS.map((wall, i) => <Wall key={i} data={wall} />)}
            </>
          )}

          {mode === 'uhaul' && (
            <>
               {showMeasurements && (
                <Grid position={[2.5, -0.01, 4]} args={[20, 20]} cellSize={1} cellThickness={1} cellColor="#404040" sectionSize={5} sectionThickness={1.5} sectionColor="#6b7280" fadeDistance={30} fadeStrength={1} />
              )}
              <UhaulTrailer />
            </>
          )}

          {items.map(item => (
            <FurnitureMesh 
              key={item.id} 
              item={item} 
              isSelected={selectedId === item.id}
              onSelect={() => setSelectedId(item.id)}
              onUpdate={updateItemPosition}
            />
          ))}

          {mode === 'apartment' ? (
            <OrbitControls makeDefault target={[18, 0, 15]} minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.1} />
          ) : (
            <OrbitControls makeDefault target={[2.5, 2.5, 4]} minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.1} />
          )}
        </Canvas>
        
        <div className="absolute top-4 left-4 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 p-3 rounded-lg pointer-events-none">
          <p className="text-sm text-neutral-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            Click an item to select it, then drag arrows to move
          </p>
          <p className="text-sm text-neutral-300 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Use "Stack Down" button to place items on top of each other
          </p>
        </div>
      </div>
    </div>
  );
}
