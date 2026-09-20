import { WardData, AlertItem } from '../types';

export function evaluateWardAlerts(ward: WardData): AlertItem[] {
  const alerts: AlertItem[] = [];
  const hvi = ward.normalized_hvi ?? 6.0;
  const lst = ward.lst_celsius;
  const temp = ward.current_temp_celsius;
  const humidity = ward.current_humidity_pct;

  // Approximate Steadman Heat Index
  const heatIndex = Math.round((temp + (humidity / 100) * 5.2) * 10) / 10;
  const timeStr = 'Today, Live Telemetry Active';

  // RED ALERT: Extreme Heat Danger
  if (hvi >= 7.5 || lst >= 43.0 || heatIndex >= 45.0) {
    alerts.push({
      alert_id: `ALT-RED-${ward.ward_id}`,
      ward_id: ward.ward_id,
      ward_name: ward.ward_name,
      level: 'RED',
      headline_en: `CRITICAL RED ALERT: Severe Heatwave Conditions in ${ward.ward_name}`,
      headline_te: `తీవ్రమైన ఉష్ణ ప్రకోప రెడ్ అలర్ట్: ${ward.ward_name} లో అత్యంత ప్రమాదకర పరిస్థితులు`,
      trigger_metric: `Heat Index: ${heatIndex}°C | LST: ${lst}°C | HVI: ${hvi}/10`,
      advisory_en: 'Immediate emergency protocols active. Mandatory work stoppage for outdoor labor between 11:30 AM – 4:00 PM. Activate municipal air-cooled relief shelters and dispatch mobile electrolyte water tankers.',
      advisory_te: 'తక్షణమే అత్యవసర చర్యలు చేపట్టాలి. ఉదయం 11:30 నుండి సాయంత్రం 4:00 వరకు బహిరంగ పనులను ఆపాలి. ప్రభుత్వ కూలింగ్ కేంద్రాలను తెరవండి మరియు మంచినీటి ట్యాంకర్లను పంపండి.',
      issued_at: timeStr
    });
  }
  // AMBER ALERT: Elevated Heat Stress Warning
  else if (hvi >= 5.0 || lst >= 39.5 || heatIndex >= 41.0) {
    alerts.push({
      alert_id: `ALT-AMB-${ward.ward_id}`,
      ward_id: ward.ward_id,
      ward_name: ward.ward_name,
      level: 'AMBER',
      headline_en: `HEAT STRESS WARNING: Heightened Thermal Risk in ${ward.ward_name}`,
      headline_te: `ఉష్ణ ఒత్తిడి హెచ్చరిక (ఆంబర్ అలర్ట్): ${ward.ward_name} లో పెరిగిన వేడి`,
      trigger_metric: `Heat Index: ${heatIndex}°C | LST: ${lst}°C | HVI: ${hvi}/10`,
      advisory_en: 'Heightened caution for senior citizens (60+), young children, and outdoor vendors. Ensure continuous fluid intake, avoid sugary beverages, and seek shaded environments.',
      advisory_te: 'వృద్ధులు (60+), చిన్నపిల్లలు మరియు వీధి వ్యాపారులు అప్రమత్తంగా ఉండాలి. నిరంతరం మంచి నీరు తాగాలి, ఎండలో తిరగవద్దు.',
      issued_at: timeStr
    });
  }
  // YELLOW ALERT: Standard Summer Monitoring Advisory
  else {
    alerts.push({
      alert_id: `ALT-YEL-${ward.ward_id}`,
      ward_id: ward.ward_id,
      ward_name: ward.ward_name,
      level: 'YELLOW',
      headline_en: `HEAT ADVISORY: Normal Summer Conditions in ${ward.ward_name}`,
      headline_te: `సాధారణ వేసవి సూచన (ఎల్లో అలర్ట్): ${ward.ward_name} లో సాధారణ వేడి`,
      trigger_metric: `Heat Index: ${heatIndex}°C | LST: ${lst}°C | HVI: ${hvi}/10`,
      advisory_en: 'Thermal conditions remain within seasonal tolerance. Maintain standard hydration habits and observe routine healthcare dispensary preparedness.',
      advisory_te: 'పరిస్థితులు అదుపులోనే ఉన్నాయి. సాధారణ జాగ్రత్తలు పాటిస్తూ సరిపడా నీరు తాగండి.',
      issued_at: timeStr
    });
  }

  return alerts;
}
