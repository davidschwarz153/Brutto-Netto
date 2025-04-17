import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

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
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [bruttoJahr, setBruttoJahr] = useState<number>(50000);
  const [nettoMonat, setNettoMonat] = useState<number>(0);
  const [nettoJahrResult, setNettoJahrResult] = useState<number>(0);
  const [lohnsteuerJahr, setLohnsteuerJahr] = useState<number>(0);
  const [soliJahr, setSoliJahr] = useState<number>(0);
  const [kvJahr, setKvJahr] = useState<number>(0);
  const [pvJahr, setPvJahr] = useState<number>(0);
  const [rvJahr, setRvJahr] = useState<number>(0);
  const [avJahr, setAvJahr] = useState<number>(0);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isJahresgehalt, setIsJahresgehalt] = useState<boolean>(true);
  const [bruttoMonat, setBruttoMonat] = useState<number>(Math.round(50000 / 12));

  useEffect(() => {
    berechneNetto();
  }, [bruttoJahr, bruttoMonat, isJahresgehalt]);

  const berechneNetto = () => {
    // Bestimme das Jahresgehalt basierend auf der Auswahl
    const jahresgehalt = isJahresgehalt ? bruttoJahr : bruttoMonat * 12;
    
    const basisKV_PV = Math.min(jahresgehalt, BBG_KV_PV_2025);
    const basisRV_AV = Math.min(jahresgehalt, BBG_RV_AV_2025_WEST);

    const kv = basisKV_PV * (KV_RATE_EMPLOYEE + KV_ZUSATZBEITRAG_AVG_2025_EMPLOYEE);
    const pv = basisKV_PV * PV_RATE_EMPLOYEE;
    const rv = basisRV_AV * RV_RATE_EMPLOYEE;
    const av = basisRV_AV * AV_RATE_EMPLOYEE;

    setKvJahr(kv);
    setPvJahr(pv);
    setRvJahr(rv);
    setAvJahr(av);

    const sozialabgaben = kv + pv + rv + av;

    const zvE_lohnsteuer = Math.max(0, jahresgehalt - GRUNDFREIBETRAG_2025);

    const lohnsteuer = berechneLohnsteuer2025(zvE_lohnsteuer);
    const soli = lohnsteuer > SOLI_THRESHOLD_SINGLE_2025 ? lohnsteuer * SOLI_RATE : 0;

    setLohnsteuerJahr(lohnsteuer);
    setSoliJahr(soli);

    const gesamtAbzuege = sozialabgaben + lohnsteuer + soli;

    const nettoJahr = jahresgehalt - gesamtAbzuege;
    setNettoJahrResult(nettoJahr);
    setNettoMonat(Math.round(nettoJahr / 12));
  };

  const handleBruttoChange = (value: number) => {
    if (isJahresgehalt) {
      setBruttoJahr(value);
      setBruttoMonat(Math.round(value / 12));
    } else {
      setBruttoMonat(value);
      setBruttoJahr(value * 12);
    }
  };

  const toggleGehaltsart = () => {
    setIsJahresgehalt(!isJahresgehalt);
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
    <div className="py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className={`max-w-3xl mx-auto shadow-md rounded-lg overflow-hidden w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl sm:text-3xl font-semibold text-center sm:text-left transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Brutto-Netto-Rechner 2025
              <span className={`text-xs sm:text-sm ml-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>(Vorläufig)</span>
            </h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="bruttoJahr" className={`block text-sm font-bold transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {isJahresgehalt ? "Brutto-Jahresgehalt (€):" : "Brutto-Monatsgehalt (€):"}
              </label>
              <div className="flex items-center">
                <span className={`text-xs mr-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monatlich</span>
                <button
                  onClick={toggleGehaltsart}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    isJahresgehalt 
                      ? 'bg-indigo-600' 
                      : 'bg-gray-300'
                  }`}
                  aria-label="Toggle between monthly and yearly salary"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      isJahresgehalt ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-xs ml-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Jährlich</span>
              </div>
            </div>
            <input
              type="number"
              id="bruttoJahr"
              value={isJahresgehalt ? bruttoJahr : bruttoMonat}
              onChange={(e) => handleBruttoChange(Number(e.target.value))}
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'text-gray-700'
              }`}
            />
          </div>

          <div className={`mb-6 py-4 border-t transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-row items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Netto-Gehalt</h2>
                <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ihr voraussichtliches Netto:</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(nettoMonat)} <span className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/ Monat</span></p>
                <p className={`text-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatCurrency(nettoJahrResult)} <span className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/ Jahr</span></p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={toggleDetails}
                className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              >
                {showDetails ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Weniger Details
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                    Mehr Details
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`transition-all duration-700 ease-in-out overflow-hidden transform ${showDetails ? 'max-h-[2000px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}`}>
            <div className="mt-">
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Details der Abzüge</h3>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y shadow-sm rounded-md transition-colors duration-200 ${
                  isDarkMode 
                    ? 'divide-gray-700 bg-gray-800' 
                    : 'divide-gray-200 bg-white'
                }`}>
                  <thead className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Posten
                      </th>
                      <th scope="col" className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Monatlich
                      </th>
                      <th scope="col" className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Jährlich
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-200 ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    <tr>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Brutto-Gehalt</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(isJahresgehalt ? bruttoJahr / 12 : bruttoMonat)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(isJahresgehalt ? bruttoJahr : bruttoMonat * 12)}</td>
                    </tr>
                    <tr>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Lohnsteuer</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(lohnsteuerJahr / 12)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(lohnsteuerJahr)}</td>
                    </tr>
                    <tr>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kirchensteuer</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(0)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(0)}</td>
                    </tr>
                    <tr>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Solidaritätszuschlag</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(soliJahr / 12)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(soliJahr)}</td>
                    </tr>
                    <tr>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Krankenversicherung</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(kvJahr / 12)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(kvJahr)}</td>
                    </tr>
                    <tr>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Pflegeversicherung</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(pvJahr / 12)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(pvJahr)}</td>
                    </tr>
                    <tr>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Rentenversicherung</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(rvJahr / 12)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(rvJahr)}</td>
                    </tr>
                    <tr>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Arbeitslosenversicherung</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(avJahr / 12)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(avJahr)}</td>
                    </tr>
                    <tr className="font-bold">
                      <td className={`px-4 py-3 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Netto-Gehalt</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-indigo-600 text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(nettoMonat)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-indigo-600 text-right transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(nettoJahrResult)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BruttoNettoRechnerModern;