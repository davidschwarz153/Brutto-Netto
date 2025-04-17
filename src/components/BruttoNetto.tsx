import  { useState, useEffect } from "react";

const GRUNDFREIBETRAG_2024 = 11604;
const GRUNDFREIBETRAG_MARRIED_2024 = 2 * GRUNDFREIBETRAG_2024;

const BBG_KV_PV_2024 = 62100;
const BBG_RV_AV_2024_WEST = 90600;
const BBG_RV_AV_2024_OST = 89400;

const KV_RATE_EMPLOYEE = 0.073;
const KV_ZUSATZBEITRAG_AVG_2024_EMPLOYEE = 0.0085;
const RV_RATE_EMPLOYEE = 0.093;
const AV_RATE_EMPLOYEE = 0.013;
const PV_RATE_EMPLOYEE_MIT_KIND = 0.017;
const PV_RATE_EMPLOYEE_CHILDLESS = 0.023;

const TAX_BRACKET_1_LIMIT_2024 = GRUNDFREIBETRAG_2024;
const TAX_BRACKET_2_LIMIT_2024 = 17005;
const TAX_BRACKET_3_LIMIT_2024 = 66760;
const TAX_BRACKET_4_LIMIT_2024 = 277825;

const SOLI_THRESHOLD_SINGLE_2024 = 18130;
const SOLI_THRESHOLD_MARRIED_2024 = 36260;
const SOLI_RATE = 0.055;

const KIRCHENSTEUER_RATE_DEFAULT = 0.09;
const KIRCHENSTEUER_RATE_BW_BY = 0.08;

const WERBUNGSKOSTEN_PAUSCHALE = 1230;
const SONDERABGABEN_PAUSCHALE = 36;

const Steuerklassen = {
  1: { name: "I: ledig/geschieden/verwitwet", isMarried: false },
  2: { name: "II: alleinerziehend", isMarried: false },
  3: { name: "III: verheiratet (Allein-/Besserverdiener)", isMarried: true },
  4: { name: "IV: verheiratet (beide ähnlich)", isMarried: true },
  5: { name: "V: verheiratet (Geringverdiener)", isMarried: true },
  6: { name: "VI: Zweitjob/weitere LST-Karte", isMarried: false },
};

interface Abzuege {
  lohnsteuer: number;
  soli: number;
  kirchensteuer: number;
  kv: number;
  rv: number;
  av: number;
  pv: number;
  gesamtSozialabgaben: number;
  gesamtSteuern: number;
  gesamt: number;
}

const BruttoNettoRechner2024 = () => {
  const [bruttoJahr, setBruttoJahr] = useState<number>(50000);
  const [steuerklasse, setSteuerklasse] = useState<number>(1);
  const [hatKinder] = useState<boolean>(false);
  const [istInKirche] = useState<boolean>(false);
  const [bundesland] = useState<string>("HE");
  const [arbeitsortOst] = useState<boolean>(false);

  const [netto, setNetto] = useState<number | null>(null);
  const [abzuege, setAbzuege] = useState<Abzuege | null>(null);
  // Removed unused calculationYear state

  useEffect(() => {
    berechneNetto();
  }, [bruttoJahr, steuerklasse, hatKinder, istInKirche, bundesland, arbeitsortOst]);

  const berechneNetto = () => {
    const currentWarnings: string[] = [];
    const steuerklasseInfo = Steuerklassen[steuerklasse as keyof typeof Steuerklassen];
    let grundfreibetrag = GRUNDFREIBETRAG_2024;
    if (steuerklasse === 3) {
      grundfreibetrag = GRUNDFREIBETRAG_MARRIED_2024;
    } else if (steuerklasse === 6) {
      grundfreibetrag = 0;
    }

    const bbg_rv_av = arbeitsortOst ? BBG_RV_AV_2024_OST : BBG_RV_AV_2024_WEST;
    const basisKV_PV = Math.min(bruttoJahr, BBG_KV_PV_2024);
    const basisRV_AV = Math.min(bruttoJahr, bbg_rv_av);

    const kvBeitrag = basisKV_PV * (KV_RATE_EMPLOYEE + KV_ZUSATZBEITRAG_AVG_2024_EMPLOYEE);
    const rvBeitrag = basisRV_AV * RV_RATE_EMPLOYEE;
    const avBeitrag = basisRV_AV * AV_RATE_EMPLOYEE;

    const pvBasisSatz = hatKinder ? PV_RATE_EMPLOYEE_MIT_KIND : PV_RATE_EMPLOYEE_CHILDLESS;
    let pvBeitrag = basisKV_PV * pvBasisSatz;
    if (!hatKinder && bundesland === "SN") {
      currentWarnings.push("PV-Berechnung für Sachsen (SN) ist hier vereinfacht.");
    }

    const gesamtSozialabgaben = kvBeitrag + rvBeitrag + avBeitrag + pvBeitrag;

    currentWarnings.push("Berechnung des zu versteuernden Einkommens (zvE) ist stark vereinfacht (keine korrekte Vorsorgepauschale).");
    const abzugsfahigeVorsorgeaufwendungen_SIMPLIFIED = gesamtSozialabgaben;
    let zvE = bruttoJahr - abzugsfahigeVorsorgeaufwendungen_SIMPLIFIED - WERBUNGSKOSTEN_PAUSCHALE;
    if (steuerklasse !== 3) {
      zvE -= SONDERABGABEN_PAUSCHALE;
    } else {
      zvE -= SONDERABGABEN_PAUSCHALE * 2;
    }
    zvE = Math.max(0, zvE - grundfreibetrag);

    currentWarnings.push("Lohnsteuerberechnung verwendet stark vereinfachte Formeln/Tarifzonen.");
    const lohnsteuer = berechneLohnsteuer_Vereinfacht_2024(zvE);

    const soliThreshold = steuerklasseInfo.isMarried ? SOLI_THRESHOLD_MARRIED_2024 : SOLI_THRESHOLD_SINGLE_2024;
    const soli = berechneSoli(lohnsteuer, soliThreshold);

    const kirchensteuerSatz = (bundesland === "BY" || bundesland === "BW") ? KIRCHENSTEUER_RATE_BW_BY : KIRCHENSTEUER_RATE_DEFAULT;
    const kirchensteuer = istInKirche ? lohnsteuer * kirchensteuerSatz : 0;

    const gesamtSteuern = lohnsteuer + soli + kirchensteuer;
    const gesamtAbzuege = gesamtSozialabgaben + gesamtSteuern;
    const nettoErgebnis = bruttoJahr - gesamtAbzuege;

    setAbzuege({
      lohnsteuer,
      soli,
      kirchensteuer,
      kv: kvBeitrag,
      rv: rvBeitrag,
      av: avBeitrag,
      pv: pvBeitrag,
      gesamtSozialabgaben,
      gesamtSteuern,
      gesamt: gesamtAbzuege,
    });

    setNetto(nettoErgebnis);
  };

  const berechneLohnsteuer_Vereinfacht_2024 = (zvE: number): number => {
    if (zvE <= 0) return 0;

    let steuer = 0;

    if (zvE <= TAX_BRACKET_1_LIMIT_2024) {
      steuer = 0;
    } else if (zvE <= TAX_BRACKET_2_LIMIT_2024) {
      const y = (zvE - TAX_BRACKET_1_LIMIT_2024) / 10000;
      steuer = (1008.70 * y + 1400) * y;
    } else if (zvE <= TAX_BRACKET_3_LIMIT_2024) {
      const z = (zvE - TAX_BRACKET_2_LIMIT_2024) / 10000;
      steuer = (181.19 * z + 2397) * z + 952.48;
    } else if (zvE <= TAX_BRACKET_4_LIMIT_2024) {
      steuer = 0.42 * zvE - 10253.58;
    } else {
      steuer = 0.45 * zvE - 18612.90;
    }

    return Math.max(0, Math.round(steuer * 100) / 100);
  };

  const berechneSoli = (lohnsteuer: number, soliThreshold: number): number => {
    if (lohnsteuer <= soliThreshold) {
      return 0;
    } else {
      return Math.round(lohnsteuer * SOLI_RATE * 100) / 100;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-center">Brutto-Netto-Rechner</h2>

      <div>
        <label className="block font-medium text-gray-700">Brutto-Jahresgehalt (€):</label>
        <input
          type="number"
          value={bruttoJahr}
          onChange={(e) => setBruttoJahr(Number(e.target.value))}
          className="w-full mt-2 p-2 border rounded-lg border-gray-300"
        />
      </div>

      <div>
        <label className="block font-medium text-gray-700">Steuerklasse:</label>
        <select
          value={steuerklasse}
          onChange={(e) => setSteuerklasse(Number(e.target.value))}
          className="w-full mt-2 p-2 border rounded-lg border-gray-800 bg-gray-950 text-white"
        >
          {Object.entries(Steuerklassen).map(([key, { name }]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {netto !== null && abzuege !== null && (
        <div className="p-4 rounded-lg mt-6 border border-gray-200">
          
          <p className="text-lg mt-2">Netto-Jahresgehalt: <span className="text-green-900 font-semibold" >{netto.toFixed(2)} €</span> </p>
          <p className="text-lg">Netto-Monatsgehalt: <span className="text-green-900 font-semibold" >{(netto / 12).toFixed(2)} €</span> </p>
        </div>
      )}
    </div>
  );
};

export default BruttoNettoRechner2024;
