<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\Region;

class CityPerequationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Création des Régions basées sur les Dépôts d'approvisionnement
        $regions = [
            'Littoral' => Region::firstOrCreate(['name' => 'Littoral']),
            'Sud-Ouest' => Region::firstOrCreate(['name' => 'Sud-Ouest']),
            'Centre_Sud' => Region::firstOrCreate(['name' => 'Centre-Sud']),
            'Ouest' => Region::firstOrCreate(['name' => 'Ouest']),
            'Nord-Ouest' => Region::firstOrCreate(['name' => 'Nord-Ouest']),
            'Est' => Region::firstOrCreate(['name' => 'Est']),
            'Adamaoua' => Region::firstOrCreate(['name' => 'Adamaoua']),
            'Nord' => Region::firstOrCreate(['name' => 'Nord']),
            'Extreme-Nord' => Region::firstOrCreate(['name' => 'Extrême-Nord']),
        ];

        // 2. Définition des coûts. 
        // IMPORTANT : Les villes "Dépôts" utilisent le vrai taux de péréquation de la structure des prix.
        $dataCSPH = [
            // DEPOT DE DOUALA (Littoral)
            'Littoral' => [
                ['name' => 'DOUALA', 'cost' => 31759.69], // Vrai Taux CSPH Douala
                ['name' => 'BELLA', 'cost' => 15858],
                ['name' => 'BIPINDI', 'cost' => 29720],
                ['name' => 'BOMONO', 'cost' => 2937],
                ['name' => 'CAMPO', 'cost' => 30660],
                ['name' => 'DIBOMBARI', 'cost' => 5051],
                ['name' => 'DIZANGUE', 'cost' => 10925],
                ['name' => 'EDEA', 'cost' => 8223],
                ['name' => 'KRIBI', 'cost' => 20557],
                ['name' => 'LOUM', 'cost' => 12687],
                ['name' => 'MANENGOLE', 'cost' => 15271],
                ['name' => 'MANJO', 'cost' => 14684],
                ['name' => 'MBANGA', 'cost' => 8693],
                ['name' => 'MOUANKO', 'cost' => 17621],
                ['name' => 'NKAPA', 'cost' => 3524],
                ['name' => 'NYETE', 'cost' => 25256],
                ['name' => 'NYAMBANG', 'cost' => 21849],
                ['name' => 'PENJA-NJOMBE', 'cost' => 11277],
                ['name' => 'POUMA', 'cost' => 17151],
                ['name' => 'SOUZA', 'cost' => 5639],
                ['name' => 'YABASSI', 'cost' => 11160],
            ],

            // DEPOT DE LIMBE (Sud-Ouest)
            'Sud-Ouest' => [
                ['name' => 'LIMBE', 'cost' => 8693],
                ['name' => 'BUEA', 'cost' => 8105],
                ['name' => 'EKONA', 'cost' => 11747],
                ['name' => 'IDENAU', 'cost' => 10455],
                ['name' => 'KOMPINA', 'cost' => 5874],
                ['name' => 'KUMBA', 'cost' => 15741],
                ['name' => 'MAMFE', 'cost' => 37003],
                ['name' => 'MBONGUE', 'cost' => 6931],
                ['name' => 'MUTENGENE', 'cost' => 2467],
                ['name' => 'MUYUKA', 'cost' => 18208],
                ['name' => 'SUPE', 'cost' => 6578],
                ['name' => 'TIKO', 'cost' => 6813],
                ['name' => 'TOMBEL', 'cost' => 24081],
            ],

            // DEPOT DE YAOUNDE (Centre & Sud)
            'Centre_Sud' => [
                ['name' => 'YAOUNDE', 'cost' => 4712.90], // Vrai Taux CSPH Yaoundé
                ['name' => 'ABONG-MBANG', 'cost' => 30542], 
                ['name' => 'AKONO', 'cost' => 7636],
                ['name' => 'AKONOLINGA', 'cost' => 14096],
                ['name' => 'AMBAM', 'cost' => 31717],
                ['name' => 'ATOLOK METET', 'cost' => 7870],
                ['name' => 'AYOS', 'cost' => 19970],
                ['name' => 'BAFIA', 'cost' => 14096],
                ['name' => 'BIWONG', 'cost' => 21145],
                ['name' => 'BOUMNYEBEL', 'cost' => 10572],
                ['name' => 'DJOUM', 'cost' => 32304],
                ['name' => 'EBOLOWA', 'cost' => 18795],
                ['name' => 'ENDOM', 'cost' => 16446],
                ['name' => 'ESEKA', 'cost' => 14096],
                ['name' => 'ESSE', 'cost' => 10337],
                ['name' => 'LOLODORF', 'cost' => 21262],
                ['name' => 'MAKAK LIBAMBA', 'cost' => 12922],
                ['name' => 'MBALMAYO', 'cost' => 5874],
                ['name' => 'MESSONDO', 'cost' => 18795],
                ['name' => 'MEYO CENTRE', 'cost' => 26548],
                ['name' => 'MEYOMESSALA', 'cost' => 22437],
                ['name' => 'MFOU', 'cost' => 3172],
                ['name' => 'MONATELE', 'cost' => 11512],
                ['name' => 'NANGA EBOKO', 'cost' => 19970],
                ['name' => 'NATCHIGAL', 'cost' => 8693],
                ['name' => 'NGOMEDZAP', 'cost' => 13979],
                ['name' => 'NGOULEMAKONG', 'cost' => 17033],
                ['name' => 'NKOTENG', 'cost' => 15271],
                ['name' => 'NTUI', 'cost' => 14096],
                ['name' => 'OBALA', 'cost' => 4464],
                ['name' => 'SANGMELIMA', 'cost' => 19735],
                ['name' => 'SA\'A', 'cost' => 8810],
                ['name' => 'YOKO', 'cost' => 11747],
                ['name' => 'ZOETELE', 'cost' => 14919],
            ],

            // DEPOT DE BAFOUSSAM (Ouest)
            'Ouest' => [
                ['name' => 'BAFOUSSAM', 'cost' => 780.80], // Vrai Taux CSPH Bafoussam
                ['name' => 'BABADJOU', 'cost' => 4464],
                ['name' => 'BAFANG', 'cost' => 7048],
                ['name' => 'BAHAM', 'cost' => 2349],
                ['name' => 'BANDJOUN', 'cost' => 1645],
                ['name' => 'BANGANGTE', 'cost' => 5756],
                ['name' => 'BANKIM', 'cost' => 19500],
                ['name' => 'BANKOUOP', 'cost' => 4111],
                ['name' => 'BANSOA', 'cost' => 3524],
                ['name' => 'BANYO', 'cost' => 33244],
                ['name' => 'BARE', 'cost' => 13861],
                ['name' => 'BAZOU', 'cost' => 7636],
                ['name' => 'DSCHANG', 'cost' => 6461],
                ['name' => 'FOUMBAN', 'cost' => 8458],
                ['name' => 'FOUMBOT', 'cost' => 3172],
                ['name' => 'GALIM', 'cost' => 5286],
                ['name' => 'KEKEM', 'cost' => 8340],
                ['name' => 'KOUTABA', 'cost' => 5639],
                ['name' => 'MAGBA', 'cost' => 15506],
                ['name' => 'MAKENENE', 'cost' => 12922],
                ['name' => 'MALANTOUEN', 'cost' => 15624],
                ['name' => 'MAPE', 'cost' => 18795],
                ['name' => 'MELONG', 'cost' => 11512],
                ['name' => 'NDIKINIMEKI', 'cost' => 13627],
                ['name' => 'NKONGSAMBA', 'cost' => 14684],
                ['name' => 'SANTCHOU', 'cost' => 15271],
                ['name' => 'TONGA', 'cost' => 9515],
            ],

            // DEPOT DE BAMENDA (Nord-Ouest)
            'Nord-Ouest' => [
                ['name' => 'BAMENDA', 'cost' => -10181.83], // Vrai Taux CSPH Bamenda
                ['name' => 'BAFUT', 'cost' => 1410],
                ['name' => 'BALI', 'cost' => 5051],
                ['name' => 'BAMENDJOU', 'cost' => 10102], 
                ['name' => 'BAMBUI', 'cost' => 1880],
                ['name' => 'BATIBO', 'cost' => 4934],
                ['name' => 'KUMBO', 'cost' => 11395],
                ['name' => 'FUNDONG', 'cost' => 7283],
                ['name' => 'MBOUDA', 'cost' => 5756], 
                ['name' => 'NJINIKOM', 'cost' => 6813],
                ['name' => 'MBENGWI', 'cost' => 2819],
                ['name' => 'NDOP', 'cost' => 4581],
                ['name' => 'NDU', 'cost' => 14919],
                ['name' => 'NKAMBE', 'cost' => 18208],
                ['name' => 'SANTA', 'cost' => 2702],
                ['name' => 'WUM', 'cost' => 9045],
            ],

            // DEPOT DE NGAOUNDERE (Adamaoua)
            'Adamaoua' => [
                ['name' => 'NGAOUNDERE', 'cost' => -54870.55], // Vrai Taux CSPH Ngaoundéré (Négatif)
                ['name' => 'MEIGANGA', 'cost' => 18795],
                ['name' => 'NGAOUNDAL', 'cost' => 36886],
                ['name' => 'NGAWI', 'cost' => 37590],
                ['name' => 'TIBATI', 'cost' => 33949],
                ['name' => 'TIGNERE', 'cost' => 28310],
            ],

            // DEPOT DE GAROUA (Nord)
            'Nord' => [
                ['name' => 'GAROUA', 'cost' => -94858.41], // Vrai Taux CSPH Garoua (Négatif)
                ['name' => 'PITOA', 'cost' => 2937],
                ['name' => 'LAGDO', 'cost' => 4699],
                ['name' => 'FIGUIL', 'cost' => 11747],
                ['name' => 'GUIDER', 'cost' => 11747],
                ['name' => 'MINDIF', 'cost' => 14096], 
                ['name' => 'POLI', 'cost' => 16681],
                ['name' => 'TCHLORILE', 'cost' => 25256],
                ['name' => 'TOUBORO', 'cost' => 46988],
            ],

            // DEPOT DE MAROUA (Extrême-Nord)
            'Extreme-Nord' => [
                ['name' => 'MAROUA', 'cost' => -118364.81], // Vrai Taux CSPH Maroua (Négatif)
                ['name' => 'MOKOLO', 'cost' => 7048],
                ['name' => 'KAELE', 'cost' => 7048],
                ['name' => 'MORA', 'cost' => 6461],
                ['name' => 'YAGOUA', 'cost' => 11747],
                ['name' => 'WAZA', 'cost' => 14096],
                ['name' => 'KOUSSERI', 'cost' => 30542],
            ],

            // DEPOT DE NDOUMBI / BERTOUA (Est)
            'Est' => [
                ['name' => 'NDOUMBI', 'cost' => -48610.27], // Vrai Taux CSPH Ndoumbi (Négatif)
                ['name' => 'BERTOUA', 'cost' => -48610.27], // Vrai Taux CSPH Bertoua (Négatif)
                ['name' => 'ABONG-MBANG', 'cost' => 9867], 
                ['name' => 'ANGOSSAS', 'cost' => 17151],
                ['name' => 'ATOK', 'cost' => 20322],
                ['name' => 'BATOURI', 'cost' => 11160],
                ['name' => 'BELABO', 'cost' => 8105],
                ['name' => 'BETARE-OYA', 'cost' => 21497],
                ['name' => 'DIANG', 'cost' => 3054],
                ['name' => 'DIMAKO', 'cost' => 3054],
                ['name' => 'DOUME', 'cost' => 5874],
                ['name' => 'DOUMENTANG', 'cost' => 13627],
                ['name' => 'GARI GOMBO', 'cost' => 25726],
                ['name' => 'GAROUA BOULAI', 'cost' => 30660],
                ['name' => 'KENZOU', 'cost' => 23494],
                ['name' => 'KETTE', 'cost' => 19735],
                ['name' => 'LOMIE', 'cost' => 28898],
                ['name' => 'MBANG', 'cost' => 20557],
                ['name' => 'MESSOK', 'cost' => 36063],
                ['name' => 'MESSAMENA', 'cost' => 25256],
                ['name' => 'MINDOURI', 'cost' => 21614],
                ['name' => 'MBOMA', 'cost' => 19500],
                ['name' => 'MOLOUNDOU', 'cost' => 60027],
                ['name' => 'NDELELE', 'cost' => 22084],
                ['name' => 'NGOILA', 'cost' => 40527],
                ['name' => 'NGUELEMENDOUKA', 'cost' => 16446],
                ['name' => 'SALAPOUMBE', 'cost' => 49690],
                ['name' => 'SOMALOMO', 'cost' => 31952],
                ['name' => 'YOKADOUMA', 'cost' => 33831],
            ],
        ];

        // 3. Boucle d'insertion en base de données
        foreach ($dataCSPH as $regionKey => $cities) {
            $regionId = $regions[$regionKey]->id;

            foreach ($cities as $cityData) {
                City::updateOrCreate(
                    ['name' => $cityData['name']], 
                    [
                        'region_id' => $regionId,
                        'transport_cost_per_tonne' => $cityData['cost']
                    ]
                );
            }
        }
    }
}