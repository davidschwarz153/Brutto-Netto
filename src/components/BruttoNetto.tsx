import { useState, useEffect } from "react";

const GRUNDFREIBETRAG_2025 = 11604;
const BBG_KV_PV_2025 = 62100;
const BBG_RV_AV_2025_WEST = 90600;

const KV_RATE_EMPLOYEE = 0.073;
const KV_ZUSATZBEITRAG_AVG_2025_EMPLOYEE = 0.0085;
const RV_RATE_EMPLOYEE = 0.093;
const AV_RATE_EMPLOYEE = 0.013;
const PV_RATE_EMPLOYEE = 0.019;

// const WERBUNGSKOSTEN_PAUSCHALE = 1230;
// const SONDERABGABEN_PAUSCHALE = 36;

const SOLI_THRESHOLD_SINGLE_2025 = 18130;
const SOLI_RATE = 0.055;

const TAX_BRACKET_2_LIMIT_2025 = 17050;
const TAX_BRACKET_3_LIMIT_2025 = 69321;
const TAX_BRACKET_4_LIMIT_2025 = 277825;

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
};

const BruttoNettoRechnerModern = () => {
  const [bruttoJahr, setBruttoJahr] = useState<number>(50000);
  const [nettoMonat, setNettoMonat] = useState<number>(0);
  const [nettoJahrResult, setNettoJahrResult] = useState<number>(0);
  const [lohnsteuerJahr, setLohnsteuerJahr] = useState<number>(0);
  const [soliJahr, setSoliJahr] = useState<number>(0);
  const [kvJahr, setKvJahr] = useState<number>(0);
  const [pvJahr, setPvJahr] = useState<number>(0);
  const [rvJahr, setRvJahr] = useState<number>(0);
  const [avJahr, setAvJahr] = useState<number>(0);
  // Removed unused state variable "abzuegeGesamtJahr"
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    berechneNetto();
  }, [bruttoJahr]);

  const berechneNetto = () => {
    const basisKV_PV = Math.min(bruttoJahr, BBG_KV_PV_2025);
    const basisRV_AV = Math.min(bruttoJahr, BBG_RV_AV_2025_WEST);

    const kv = basisKV_PV * (KV_RATE_EMPLOYEE + KV_ZUSATZBEITRAG_AVG_2025_EMPLOYEE);
    const pv = basisKV_PV * PV_RATE_EMPLOYEE;
    const rv = basisRV_AV * RV_RATE_EMPLOYEE;
    const av = basisRV_AV * AV_RATE_EMPLOYEE;

    setKvJahr(kv);
    setPvJahr(pv);
    setRvJahr(rv);
    setAvJahr(av);

    const sozialabgaben = kv + pv + rv + av;

    const zvE_lohnsteuer = Math.max(0, bruttoJahr - GRUNDFREIBETRAG_2025);

    const lohnsteuer = berechneLohnsteuer2025(zvE_lohnsteuer);
    const soli = lohnsteuer > SOLI_THRESHOLD_SINGLE_2025 ? lohnsteuer * SOLI_RATE : 0;

    setLohnsteuerJahr(lohnsteuer);
    setSoliJahr(soli);

    const gesamtAbzuege = sozialabgaben + lohnsteuer + soli;
    // Removed setAbzuegeGesamtJahr as "abzuegeGesamtJahr" is no longer used

    const nettoJahr = bruttoJahr - gesamtAbzuege;
    setNettoJahrResult(nettoJahr);
    setNettoMonat(nettoJahr / 12);
  };

  const berechneLohnsteuer2025 = (zvE: number): number => {
    if (zvE <= 0) return 0;
    if (zvE <= TAX_BRACKET_2_LIMIT_2025) {
      const y = (zvE - GRUNDFREIBETRAG_2025) / 10000;
      return (997.6 * y + 1400) * y;
    } else if (zvE <= TAX_BRACKET_3_LIMIT_2025) {
      const z = (zvE - TAX_BRACKET_2_LIMIT_2025) / 10000;
      return (206.43 * z + 2397) * z + 965.55;
    } else if (zvE <= TAX_BRACKET_4_LIMIT_2025) {
      return 0.42 * zvE - 11767.78;
    } else {
      return 0.45 * zvE - 20104.53;
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className=" min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-semibold text-gray-800 text-center mb-6">
            Brutto-Netto-Rechner 2025
            <span className="text-sm text-gray-500 ml-1">(Vorläufig)</span>
          </h1>

          <div className="mb-4">
            <label htmlFor="bruttoJahr" className="block text-gray-700 text-sm font-bold mb-2">
              Brutto-Jahresgehalt (€):
            </label>
            <input
              type="number"
              id="bruttoJahr"
              value={bruttoJahr}
              onChange={(e) => setBruttoJahr(Number(e.target.value))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-700">Netto-Gehalt</h2>
                <p className="text-gray-600 text-sm">Ihr voraussichtliches Netto:</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(nettoMonat)} <span className="text-sm text-gray-500">/ Monat</span></p>
                <p className="text-lg text-gray-600">{formatCurrency(nettoJahrResult)} <span className="text-sm text-gray-500">/ Jahr</span></p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={toggleDetails}
                className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {showDetails ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Weniger Details
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                    Mehr Details
                  </>
                )}
              </button>
            </div>
          </div>

          {showDetails && (
            <div className="mt-8 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Details der Abzüge</h3>
              <table className="min-w-full divide-y divide-gray-200 shadow-sm rounded-md">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posten
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monatlich
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jährlich
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Brutto-Gehalt</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(bruttoJahr / 12)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(bruttoJahr)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Lohnsteuer</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(lohnsteuerJahr / 12)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(lohnsteuerJahr)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Kirchensteuer</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(0)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Solidaritätszuschlag</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(soliJahr / 12)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(soliJahr)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Krankenversicherung</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(kvJahr / 12)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(kvJahr)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Pflegeversicherung</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(pvJahr / 12)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(pvJahr)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rentenversicherung</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(rvJahr / 12)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(rvJahr)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Arbeitslosenversicherung</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(avJahr / 12)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(avJahr)}</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Netto-Gehalt</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 text-right">{formatCurrency(nettoMonat)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 text-right">{formatCurrency(nettoJahrResult)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BruttoNettoRechnerModern;