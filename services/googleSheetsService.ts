
import type { Cpu, Motherboard, Ram } from '../types';

const SPREADSHEET_ID = '1ybTrAbqjVEWkX44KdcS6INkhtEwZxtmQkk_IIKhErpc';
const API_KEY = 'AIzaSyDrizXFJBBx_4G-_JQlYpD5QwCnjQ6yljM';

// --- CPU ---
const CPU_SHEET_NAME = 'CPU AMD';
const CPU_DESKTOP_RANGE = 'A5:C';
const CPU_SERVER_RANGE = 'E5:G';
const CPU_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?ranges=${encodeURIComponent(`'${CPU_SHEET_NAME}'!${CPU_DESKTOP_RANGE}`)}&ranges=${encodeURIComponent(`'${CPU_SHEET_NAME}'!${CPU_SERVER_RANGE}`)}&key=${API_KEY}`;

const parseRowsToCpus = (rows: string[][], isServer: boolean): Cpu[] => {
    return rows.map((row: string[], index: number): Cpu | null => {
      const name = row[0];
      const socket = row[1];
      const priceString = row[2];

      if (!name || !priceString) return null;
      
      const price = parseFloat(priceString.replace(/[^\d.]/g, ''));
      if (isNaN(price)) return null;

      return {
        id: `${name}-${socket}-${index}-${isServer}`, 
        name,
        socket: socket || 'N/A',
        price,
        manufacturer: 'AMD',
        isServer,
        category: 'CPU',
      };
    }).filter((cpu): cpu is Cpu => cpu !== null);
};

export const fetchCpus = async (): Promise<Cpu[]> => {
  try {
    const response = await fetch(CPU_URL);
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Sheets API Error (CPU):', errorData);
        throw new Error(errorData.error.message || 'Не удалось загрузить данные CPU. Проверьте ключ API и настройки доступа к таблице.');
    }
    const data = await response.json();
    const valueRanges = data.valueRanges || [];
    const desktopRows = valueRanges[0]?.values || [];
    const desktopCpus = parseRowsToCpus(desktopRows, false);
    const serverRows = valueRanges[1]?.values || [];
    const serverCpus = parseRowsToCpus(serverRows, true);
    return [...desktopCpus, ...serverCpus];
  } catch (error) {
    console.error("Error fetching or parsing CPU spreadsheet data:", error);
    throw error;
  }
};

// --- Motherboard & RAM ---
const MOBO_RAM_SHEET_NAME = 'MOBO RAM';
const MOBO_RANGE = 'A5:E'; // Read up to column E for price
const RAM_RANGE = 'G5:L';  // Read from G to L for RAM data to include new price column
const MOBO_RAM_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?ranges=${encodeURIComponent(`'${MOBO_RAM_SHEET_NAME}'!${MOBO_RANGE}`)}&ranges=${encodeURIComponent(`'${MOBO_RAM_SHEET_NAME}'!${RAM_RANGE}`)}&key=${API_KEY}`;

const parseRowsToMotherboards = (rows: string[][]): Motherboard[] => {
    return rows.map((row: string[], index: number): Motherboard | null => {
        const name = row[0];
        const socket = row[1];
        const formFactor = row[2];
        const priceString = row[4]; // Price is in the 5th column (E)
        
        if (!name || !priceString) return null;

        const price = parseFloat(priceString.replace(/[^\d.]/g, ''));
        if (isNaN(price)) return null;

        return {
            id: `mobo-${name}-${socket}-${index}`,
            name,
            socket: socket || 'N/A',
            formFactor: formFactor || 'N/A',
            price,
            category: 'Motherboard',
        };
    }).filter((item): item is Motherboard => item !== null);
};

const parseRowsToRam = (rows: string[][]): Ram[] => {
    return rows.map((row: string[], index: number): Ram | null => {
        // Corresponds to columns G(name), H(vendor), I(type), J(capacity), L(price)
        const name = row[0];
        const vendor = row[1];
        const type = row[2];
        const capacity = row[3];
        const priceString = row[5];

        if (!name || !priceString) return null;

        const price = parseFloat(priceString.replace(/[^\d.]/g, ''));
        if (isNaN(price)) return null;

        return {
            id: `ram-${name}-${vendor}-${type}-${capacity}-${index}`,
            name,
            vendor: vendor || 'N/A',
            type: type || 'N/A',
            capacity: capacity || 'N/A',
            price,
            category: 'RAM',
        };
    }).filter((item): item is Ram => item !== null);
};

export const fetchMoboAndRam = async (): Promise<{ motherboards: Motherboard[], ram: Ram[] }> => {
    try {
        const response = await fetch(MOBO_RAM_URL);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Sheets API Error (MOBO/RAM):', errorData);
            throw new Error(errorData.error.message || 'Не удалось загрузить данные плат и памяти. Проверьте ключ API и настройки доступа к таблице.');
        }
        const data = await response.json();
        const valueRanges = data.valueRanges || [];

        const motherboardRows = valueRanges[0]?.values || [];
        const motherboards = parseRowsToMotherboards(motherboardRows);

        const ramRows = valueRanges[1]?.values || [];
        const ram = parseRowsToRam(ramRows);
        
        return { motherboards, ram };
    } catch (error) {
        console.error("Error fetching or parsing MOBO/RAM spreadsheet data:", error);
        throw error;
    }
};