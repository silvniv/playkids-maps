import * as SQLite from 'expo-sqlite';
import type { Place } from '../types';

type CreatePlaceInput = {
  name: string;
  category: string;
  lat: number;
  lng: number;
  neighborhood?: string | null;
  address_approx?: string | null;
  description?: string | null;
  accessibility?: boolean | null;
  created_by?: string;
};

let db: SQLite.SQLiteDatabase | null = null;
let initialized = false;

async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('offline.db');
  }
  return db;
}

async function execute(sql: string, params: any[] = []): Promise<any> {
  const database = await getDb();
  return await database.runAsync(sql, params);
}

async function ensureInitialized() {
  if (initialized) return;

  try {
    await execute(`
      create table if not exists places (
        id text primary key not null,
        name text not null,
        category text not null,
        description text,
        lat real not null,
        lng real not null,
        address_approx text,
        neighborhood text,
        age_range text,
        accessibility integer,
        infra_bathroom integer,
        infra_changing_table integer,
        infra_shade integer,
        infra_water_fountain integer,
        infra_fenced integer,
        infra_toys integer,
        safety_lighting integer,
        safety_movement integer,
        safety_conservation text,
        status text,
        created_at text
      );
    `);

    // Se estiver vazio, popular com alguns exemplos de referência
    try {
      const database = await getDb();
      const result = await database.getFirstAsync(`select count(*) as total from places;`);
      const total = (result as any)?.total ?? 0;

      if (!total) {
        await seedPlaces();
      }
    } catch (error) {
      console.error('Erro ao verificar/popular tabela places:', error);
      // Tentar popular mesmo assim
      await seedPlaces();
    }

    initialized = true;
  } catch (error) {
    console.error('Erro crítico ao inicializar banco SQLite:', error);
    throw error;
  }
}

async function seedPlaces() {
  const samplePlaces: Array<Partial<Place>> = [
    {
      id: 'pkm-1',
      name: 'Parquinho Central',
      category: 'parque',
      description: 'Praça com playground infantil e área de sombra.',
      lat: -20.469,
      lng: -54.620,
      neighborhood: 'Centro',
      address_approx: 'Praça Central, Campo Grande - MS',
      accessibility: true,
      infra_bathroom: true,
      infra_changing_table: false,
      infra_shade: true,
      infra_water_fountain: true,
      infra_fenced: false,
      infra_toys: true,
      safety_lighting: true,
      safety_movement: true,
      safety_conservation: 'ok',
      status: 'verified',
    },
    {
      id: 'pkm-2',
      name: 'Parque das Crianças',
      category: 'parque',
      description: 'Área ampla com brinquedos e espaço para piquenique.',
      lat: -20.480,
      lng: -54.630,
      neighborhood: 'Bairro X',
      address_approx: 'Av. Exemplo, 1234',
      accessibility: true,
      infra_bathroom: false,
      infra_changing_table: false,
      infra_shade: true,
      infra_water_fountain: true,
      infra_fenced: true,
      infra_toys: true,
      safety_lighting: true,
      safety_movement: true,
      safety_conservation: 'good',
      status: 'verified',
    },
    {
      id: 'pkm-3',
      name: 'Praça do Bairro',
      category: 'praça',
      description: 'Pequena praça de bairro com alguns brinquedos.',
      lat: -20.490,
      lng: -54.640,
      neighborhood: 'Bairro Y',
      address_approx: 'Rua das Flores, 200',
      accessibility: false,
      infra_bathroom: false,
      infra_changing_table: false,
      infra_shade: true,
      infra_water_fountain: false,
      infra_fenced: false,
      infra_toys: true,
      safety_lighting: false,
      safety_movement: true,
      safety_conservation: 'ok',
      status: 'pending',
    },
  ];

  for (const p of samplePlaces) {
    await execute(
      `insert into places (
        id, name, category, description, lat, lng,
        address_approx, neighborhood, age_range, accessibility,
        infra_bathroom, infra_changing_table, infra_shade,
        infra_water_fountain, infra_fenced, infra_toys,
        safety_lighting, safety_movement, safety_conservation,
        status, created_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.name,
        p.category,
        p.description ?? '',
        p.lat,
        p.lng,
        p.address_approx ?? '',
        p.neighborhood ?? '',
        (p as any).age_range ?? 'mixed',
        p.accessibility ? 1 : 0,
        (p as any).infra_bathroom ? 1 : 0,
        (p as any).infra_changing_table ? 1 : 0,
        (p as any).infra_shade ? 1 : 0,
        (p as any).infra_water_fountain ? 1 : 0,
        (p as any).infra_fenced ? 1 : 0,
        (p as any).infra_toys ? 1 : 0,
        (p as any).safety_lighting ? 1 : 0,
        (p as any).safety_movement ? 1 : 0,
        (p as any).safety_conservation ?? 'ok',
        (p as any).status ?? 'verified',
        new Date().toISOString(),
      ]
    );
  }
}

function mapRowToPlace(row: any): Place {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description ?? '',
    lat: row.lat,
    lng: row.lng,
    address_approx: row.address_approx ?? '',
    neighborhood: row.neighborhood ?? '',
    age_range: row.age_range ?? 'mixed',
    accessibility: !!row.accessibility,
    infra_bathroom: !!row.infra_bathroom,
    infra_changing_table: !!row.infra_changing_table,
    infra_shade: !!row.infra_shade,
    infra_water_fountain: !!row.infra_water_fountain,
    infra_fenced: !!row.infra_fenced,
    infra_toys: !!row.infra_toys,
    safety_lighting: !!row.safety_lighting,
    safety_movement: !!row.safety_movement,
    safety_conservation: (row.safety_conservation as any) ?? 'ok',
    status: (row.status as any) ?? 'verified',
    created_by: row.created_by ?? 'offline',
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  } as Place;
}

export const offlinePlacesService = {
  async listPlaces(): Promise<Place[]> {
    await ensureInitialized();
    const database = await getDb();
    const rows = await database.getAllAsync(`select * from places order by name asc;`);
    return (rows as any[]).map(mapRowToPlace);
  },

  async getPlace(id: string): Promise<Place | null> {
    await ensureInitialized();
    const database = await getDb();
    const row = await database.getFirstAsync(`select * from places where id = ? limit 1;`, [id]);
    if (!row) return null;
    return mapRowToPlace(row);
  },

  async createPlace(input: CreatePlaceInput): Promise<Place> {
    await ensureInitialized();

    // Validar coordenadas
    if (input.lat < -90 || input.lat > 90) {
      throw new Error('Latitude inválida. Deve estar entre -90 e 90.');
    }
    if (input.lng < -180 || input.lng > 180) {
      throw new Error('Longitude inválida. Deve estar entre -180 e 180.');
    }

    const id = `offline-${Date.now()}`;
    const createdAt = new Date().toISOString();

    await execute(
      `insert into places (
        id, name, category, description, lat, lng,
        address_approx, neighborhood, age_range, accessibility,
        infra_bathroom, infra_changing_table, infra_shade,
        infra_water_fountain, infra_fenced, infra_toys,
        safety_lighting, safety_movement, safety_conservation,
        status, created_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.name,
        input.category,
        input.description ?? '',
        input.lat,
        input.lng,
        input.address_approx ?? '',
        input.neighborhood ?? '',
        'mixed',
        input.accessibility ? 1 : 0,
        0,
        0,
        1,
        0,
        0,
        1,
        1,
        1,
        'ok',
        'pending',
        createdAt,
      ]
    );

    return {
      id,
      name: input.name,
      category: input.category,
      description: input.description ?? '',
      lat: input.lat,
      lng: input.lng,
      address_approx: input.address_approx ?? '',
      neighborhood: input.neighborhood ?? '',
      age_range: 'mixed',
      accessibility: !!input.accessibility,
      infra_bathroom: false,
      infra_changing_table: false,
      infra_shade: true,
      infra_water_fountain: false,
      infra_fenced: false,
      infra_toys: true,
      safety_lighting: true,
      safety_movement: true,
      safety_conservation: 'ok',
      status: 'pending',
      created_by: input.created_by ?? 'offline',
      created_at: createdAt,
      updated_at: createdAt,
    } as Place;
  },
};
