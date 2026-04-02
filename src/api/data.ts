import { apiGet } from './client';
import type { RetrievalResponse, Site, Workforce, AllData } from '../types/data';

/** Extract data from RetrievalResponse with case-insensitive username lookup. */
function extractData<T>(response: RetrievalResponse<T>, username: string): T | null {
  // API returns lowercase keys, but our username may be mixed case
  const key = Object.keys(response.UserNameToData).find(
    (k) => k.toLowerCase() === username.toLowerCase(),
  );
  return key ? (response.UserNameToData[key].Data ?? null) : null;
}

/** Fetch sites for a user. Used by Setup polling. */
export async function getSites(username: string): Promise<Site[]> {
  const response = await apiGet<RetrievalResponse<Site[]>>(
    `/sites?username=${encodeURIComponent(username)}`,
  );
  return extractData(response, username) ?? [];
}

/** Fetch workforces for a user. Used by Setup polling. */
export async function getWorkforces(username: string): Promise<Workforce[]> {
  const response = await apiGet<RetrievalResponse<Workforce[]>>(
    `/sites/workforces?username=${encodeURIComponent(username)}`,
  );
  return extractData(response, username) ?? [];
}

/** Fetch all data categories for a user. Used by Data Overview. */
export async function getAllData(username: string): Promise<AllData | null> {
  const params = new URLSearchParams({
    username,
    include_company_data: 'true',
    include_contract_data: 'true',
    include_cxos_data: 'true',
    include_productionline_data: 'true',
    include_ship_data: 'true',
    include_flight_data: 'true',
    include_site_data: 'true',
    include_storage_data: 'true',
    include_workforce_data: 'true',
  });
  const response = await apiGet<RetrievalResponse<AllData>>(
    `/data?${params.toString()}`,
  );
  return extractData(response, username);
}
