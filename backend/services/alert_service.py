"""
Threshold-Based Urban Heat Alert & Warning System
Monitors real-time weather, LST, and HVI to trigger tiered alerts.
Levels: RED (Severe), AMBER (High), YELLOW (Advisory).
"""

from typing import Dict, Any, List
from datetime import datetime


class AlertService:
    def evaluate_ward_alerts(self, ward_data: Dict[str, Any], live_weather: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Evaluates ward indicators against critical threshold conditions.
        """
        alerts = []
        hvi = ward_data.get('normalized_hvi', 7.5)
        lst = ward_data.get('lst_celsius', 41.2)
        temp = live_weather.get('temperature_celsius', 40.5) if live_weather else ward_data.get('current_temp_celsius', 40.5)
        humidity = live_weather.get('humidity_pct', 44) if live_weather else ward_data.get('current_humidity_pct', 44)
        ward_name = ward_data.get('ward_name', 'Ward')

        # Heat Index calculation (Steadman formula approximation)
        heat_index = round(temp + (0.5555 * (6.11 * (2.71828 ** (5417.7530 * (1/273.16 - 1/(273.15 + temp)))) * (humidity/100) - 10)), 1)
        if heat_index < temp:
            heat_index = temp + 2.5

        # Critical Threshold 1: RED ALERT (Severe Heatwave Emergency)
        if hvi >= 7.5 or lst >= 43.0 or heat_index >= 46.0:
            alerts.append({
                "alert_id": f"ALT-RED-{ward_data.get('ward_id')}",
                "ward_id": ward_data.get('ward_id'),
                "ward_name": ward_name,
                "level": "RED",
                "headline_en": f"CRITICAL HEATWAVE ALERT: Severe Danger Level in {ward_name}",
                "headline_te": f"తీవ్రమైన ఉష్ణ ప్రకోప రెడ్ అలర్ట్: {ward_name} వార్డులో తీవ్ర ప్రమాదం",
                "trigger_metric": f"Heat Index: {heat_index}°C | LST: {lst}°C | HVI: {hvi}/10",
                "advisory_en": "Immediate mobilization required. Avoid direct outdoor sun between 11:00 AM – 4:30 PM. Dispatch mobile hydration vans to bus stops and marketplaces. Open all designated emergency cooling shelters.",
                "advisory_te": "తక్షణమే అత్యవసర చర్యలు చేపట్టాలి. ఉదయం 11:00 నుండి సాయంత్రం 4:30 వరకు బయటకు రావద్దు. బహిరంగ మార్కెట్లలో ఉచిత మంచినీరు, ఓఆర్‌ఎస్ పంపిణీ చేయండి. కూలింగ్ కేంద్రాలు తెరవండి.",
                "issued_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
            })

        # Threshold 2: AMBER ALERT (Heightened Vulnerability Warning)
        elif hvi >= 5.0 or lst >= 39.5 or heat_index >= 41.0:
            alerts.append({
                "alert_id": f"ALT-AMB-{ward_data.get('ward_id')}",
                "ward_id": ward_data.get('ward_id'),
                "ward_name": ward_name,
                "level": "AMBER",
                "headline_en": f"HEAT STRESS WARNING: Elevated Heat Conditions in {ward_name}",
                "headline_te": f"ఉష్ణ ఒత్తిడి హెచ్చరిక (ఆంబర్ అలర్ట్): {ward_name} లో పెరిగిన వేడి",
                "trigger_metric": f"Heat Index: {heat_index}°C | LST: {lst}°C | HVI: {hvi}/10",
                "advisory_en": "Special vigilance advised for outdoor laborers, children aged 0–6, and elderly residents. Ensure adequate hydration and restrict strenuous sports activities.",
                "advisory_te": "బహిరంగ కూలీలు, చిన్నపిల్లలు, వృద్ధులు అప్రమత్తంగా ఉండాలి. అధికంగా మంచినీరు తాగాలి. అధిక శ్రమతో కూడిన పనులను తగ్గించాలి.",
                "issued_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
            })

        # Threshold 3: YELLOW ALERT (Moderate Advisory)
        else:
            alerts.append({
                "alert_id": f"ALT-YEL-{ward_data.get('ward_id')}",
                "ward_id": ward_data.get('ward_id'),
                "ward_name": ward_name,
                "level": "YELLOW",
                "headline_en": f"HEAT ADVISORY: Normal Summer Thermal Levels in {ward_name}",
                "headline_te": f"సాధారణ వేసవి సూచన: {ward_name} లో వేడి జాగ్రత్తలు",
                "trigger_metric": f"Heat Index: {heat_index}°C | LST: {lst}°C | HVI: {hvi}/10",
                "advisory_en": "Standard summer hydration guidelines apply. Routine monitoring of community health center supply caches maintained.",
                "advisory_te": "సాధారణ జాగ్రత్తలు పాటించండి. సరిపడా నీరు తాగండి.",
                "issued_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
            })

        return alerts
