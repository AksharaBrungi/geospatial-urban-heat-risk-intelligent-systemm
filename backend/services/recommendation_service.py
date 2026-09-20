"""
Ward-Specific Heat Mitigation Recommendation Engine
Ties recommendations directly to specific breached indicator thresholds.
"""

from typing import Dict, Any, List


class RecommendationEngine:
    def generate_recommendations(self, ward_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Evaluates ward indicators and returns prioritized, actionable interventions.
        """
        recs = []
        ndvi = ward_data.get('ndvi', 0.15)
        lst = ward_data.get('lst_celsius', 41.0)
        uhc_dist = ward_data.get('uhc_distance_km', 1.8)
        outdoor_workers = ward_data.get('outdoor_workers_count', 3200)
        building_density = ward_data.get('building_density_pct', 75.0)
        low_income_pct = ward_data.get('low_income_slum_pct', 35.0)

        # 1. Vegetation / Canopy Deficit
        if ndvi < 0.20:
            recs.append({
                "id": "REC-VEG-01",
                "domain": "VEGETATION & GREEN INFRASTRUCTURE",
                "trigger": f"Low vegetation index (NDVI {ndvi} < 0.20 threshold)",
                "title_en": "Accelerated Urban Canopy & Miyawaki Pocket Forests",
                "title_te": "పట్టణ చెట్ల పెంపకం మరియు మియావాకి చిట్టడవులు",
                "action_en": "Establish dense native micro-forests along road medians, educational campuses, and open government lands to establish shade corridors and lower radiant surface temperatures by 2.0–3.5°C.",
                "action_te": "రోడ్లు, విద్యా సంస్థలు మరియు ఖాళీ ప్రభుత్వ స్థలాల్లో స్థానిక చెట్లతో చిట్టడవులు పెంచి, నీడను కల్పించి ఉపరితల వేడిని 2.0-3.5°C తగ్గించాలి.",
                "priority": "HIGH",
                "feasibility_months": 4,
                "responsible_agency": "GHMC Urban Biodiversity Wing"
            })

        # 2. Extreme Thermal Radiation
        if lst >= 40.0:
            recs.append({
                "id": "REC-COOL-02",
                "domain": "HEAT RESILIENT SURFACES",
                "trigger": f"High Land Surface Temperature ({lst}°C >= 40°C threshold)",
                "title_en": "Targeted Cool Roof & High-Albedo Coating Program",
                "title_te": "కూల్ రూఫ్ మరియు అధిక ప్రతిబింబ పూతల కార్యక్రమం",
                "action_en": "Mandate and subsidize high-reflectance solar reflective coatings (SRI > 78) on tin, asbestos, and concrete rooftops in dense commercial and residential clusters to curtail heat trapping.",
                "action_te": "రేకుల ఇళ్లు, ఆస్బెస్టాస్ మరియు కాంక్రీట్ డాబాలపై అధిక ప్రతిబింబ పూతలు వేయించి గదుల లోపల ఉష్ణోగ్రతను 3-5°C తగ్గించాలి.",
                "priority": "HIGH",
                "feasibility_months": 2,
                "responsible_agency": "Telangana State Cool Roof Policy Taskforce"
            })

        # 3. Healthcare Distance / Cooling Center Accessibility
        if uhc_dist > 1.5:
            recs.append({
                "id": "REC-HLTH-03",
                "domain": "HEALTHCARE & EMERGENCY RELIEF",
                "trigger": f"Extended UHC distance ({uhc_dist} km > 1.5 km accessibility limit)",
                "title_en": "Deploy Mobile Heat-Relief Clinics & Public Cooling Shelters",
                "title_te": "మొబైల్ హీట్ రిలీఫ్ క్లినిక్‌లు మరియు పబ్లిక్ కూలింగ్ కేంద్రాలు",
                "action_en": "Convert community halls, bus terminals, and religious complexes into air-cooled respite stations equipped with ORS packets, ice packs, and paramedical support during peak hours (12:00 PM – 4:00 PM).",
                "action_te": "కమ్యూనిటీ హాళ్లు మరియు బస్ స్టాండ్లను మధ్యాహ్నం 12 నుండి సాయంత్రం 4 గంటల వరకు చల్లని ఉపశమన కేంద్రాలుగా మార్చి, ORS మరియు ప్రథమ చికిత్స అందించాలి.",
                "priority": "HIGH" if uhc_dist > 2.0 else "MEDIUM",
                "feasibility_months": 1,
                "responsible_agency": "District Medical & Health Office (DMHO)"
            })

        # 4. Outdoor Worker & Vulnerable Labor Density
        if outdoor_workers > 2000:
            recs.append({
                "id": "REC-WRK-04",
                "domain": "LABOR & COMMUNITY RESILIENCE",
                "trigger": f"Dense outdoor workforce ({outdoor_workers:,} street vendors, construction & gig workers)",
                "title_en": "Mandated Shaded Rest Enclosures & Hydration Hubs",
                "title_te": "నీడ విశ్రాంతి స్థలాలు మరియు ఉచిత మంచినీటి కేంద్రాలు",
                "action_en": "Enforce work hour rescheduling between 12 PM - 3 PM, deploy 15 free chilled drinking water kiosks ('Chalit Chalivendram') at active intersections, and distribute heat-safe broad-brim hats.",
                "action_te": "మధ్యాహ్నం 12 నుండి 3 గంటల వరకు బహిరంగ పనులను నిలిపివేసి, ప్రధాన కూడళ్లలో ఉచిత మంచినీటి చలివేంద్రాలు మరియు ORS పంపిణీ కేంద్రాలను ఏర్పాటు చేయాలి.",
                "priority": "HIGH",
                "feasibility_months": 1,
                "responsible_agency": "Labor Department & Civic Administration"
            })

        # 5. High Density Slum Settlements
        if low_income_pct > 25.0:
            recs.append({
                "id": "REC-SLUM-05",
                "domain": "VULNERABLE SETTLEMENT RETROFIT",
                "trigger": f"Substantial low-income/slum population ({low_income_pct}%)",
                "title_en": "Passive Thermal Insulation & Green Shading Screens",
                "title_te": "సహజ ఉష్ణ నిరోధకత మరియు ఆకుపచ్చ నీడ కర్టన్లు",
                "action_en": "Distribute bamboo-mesh shading screens and agro-shade nets for narrow lanes, and conduct door-to-door heat risk education for pregnant mothers, elderly citizens, and young children.",
                "action_te": "ఇరుకైన బస్తీ సందులలో ఆకుపచ్చ నీడ నెట్లను అమర్చాలి మరియు వృద్ధులు, గర్భిణీలు, చిన్న పిల్లల ఆరోగ్య రక్షణ కోసం ఇంటింటికీ వెళ్లి అవగాహన కల్పించాలి.",
                "priority": "MEDIUM",
                "feasibility_months": 3,
                "responsible_agency": "Mission for Elimination of Poverty in Municipal Areas (MEPMA)"
            })

        return recs
