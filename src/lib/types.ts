export interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface Animal extends Entity {
  angry: boolean;
  size: number;
  wobble: number;
  wanderX: number;
  wanderY: number;
  wanderSpeedX: number;
  wanderSpeedY: number;
  wanderAmtX: number;
  wanderAmtY: number;
  baseX: number;
}

export interface AirAttacker extends Entity {
  type: 'bull' | 'bear';
  targetX: number;
  targetY: number;
  angle: number;
  speed: number;
}

export interface Jet extends Entity {
  type: 'bull' | 'bear';
  hasFired: boolean;
  fireX: number;
}

export interface Missile extends Entity {
  type: 'bull' | 'bear';
  targetX: number;
  targetY: number;
  speed: number;
}

export interface FloatingText extends Entity {
  text: string;
  color: string;
}

export interface Particle extends Entity {
  color: string;
  size: number;
  isSpark: boolean;
}

export interface Dust extends Entity {
  size: number;
}
