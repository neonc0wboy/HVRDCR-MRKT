import type { Cpu } from '../types';

const SPREADSHEET_ID = '1ybTrAbqjVEWkX44KdcS6INkhtEwZxtmQkk_IIKhErpc';
const API_KEY = 'AIzaSyDrizXFJBBx_4G-_JQlYpD5QwCnjQ6yljM';
const SHEET_NAME = 'CPU AMD';
const DESKTOP_RANGE = 'A5:C';
const SERVER_RANGE = 'E5:G';

// Using batchGet to fetch both ranges in a single API call
const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?ranges=${encodeURIComponent(`'${SHEET_NAME}'!${DESKTOP_RANGE}`)}&ranges=${encodeURIComponent(`'${SHEET_NAME}'!${SERVER_RANGE}`)}&key=${API_KEY}`;

/**
 * Parses rows of data from Google Sheets into an array of CPU objects.
 * @param rows - The 2D array of strings from the sheet.
 * @param isServer - A boolean to indicate if the CPUs are server models.
 * @returns An array of Cpu objects.
 */
const parseRowsToCpus = (rows: string[][], isServer: boolean): Cpu[] => {
    return rows.map((row: string[], index: number): Cpu | null => {
      const name = row[0];
      const socket = row[1];
      const priceString = row[2];

      // Skip row if essential data is missing
      if (!name || !priceString) {
          return null;
      }
      
      // Sanitize and parse price string
      const price = parseFloat(priceString.replace(/[^\d.]/g, ''));
      if (isNaN(price)) {
          return null;
      }

      return {
        // Create a unique ID. Appending isServer helps differentiate if a CPU name appears in both lists.
        id: `${name}-${socket}-${index}-${isServer}`, 
        name,
        socket: socket || 'N/A',
        price,
        manufacturer: 'AMD', // The sheet is named 'CPU AMD', so we can assume this.
        isServer,
      };
    }).filter((cpu): cpu is Cpu => cpu !== null); // Filter out any null entries
};


export const fetchCpus = async (): Promise<Cpu[]> => {
  try {
    const response = await fetch(URL);
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Sheets API Error:', errorData);
        throw new Error(errorData.error.message || 'Не удалось загрузить данные. Проверьте ключ API и настройки доступа к таблице.');
    }
    const data = await response.json();
    const valueRanges = data.valueRanges || [];

    // The first range in our request was for desktop CPUs
    const desktopRows = valueRanges[0]?.values || [];
    const desktopCpus = parseRowsToCpus(desktopRows, false);

    // The second range was for server CPUs
    const serverRows = valueRanges[1]?.values || [];
    const serverCpus = parseRowsToCpus(serverRows, true);

    // Combine and return both lists
    return [...desktopCpus, ...serverCpus];

  } catch (error) {
    console.error("Error fetching or parsing spreadsheet data:", error);
    throw error; // Re-throw the error to be caught by the component
  }
};
