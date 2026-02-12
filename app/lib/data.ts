// app/lib/data.ts

export const CHAMPIONSHIP_DATA: Record<string, any> = {
  "drs-26": {
    id: "drs-26",
    name: "DRS Cup '26",
    status: "Live",
    cover: "/api/placeholder/800/600",
    seasonStandings: [{ pos: 1, driver: "Max", pts: 86 }],
    seasonMedia: [],
    rounds: [
      {
        id: "bahrain",
        name: "Bahrain Round",
        circuit: "Sakhir",
        date: "Mar 02",
        flag: "🇧🇭",
        status: "Completed",
        
        // --- LEVEL 1: ROUND STANDING (Total Weekend Points) ---
        roundStandings: [
          { pos: 1, driver: "Max Verstappen", team: "Red Bull", pts: 33 }, // 25 (Feature) + 8 (Sprint)
          { pos: 2, driver: "Sergio Perez", team: "Red Bull", pts: 22 },
        ],
        
        roundMedia: ["/api/placeholder/800/400"],

        // --- LEVEL 2: RACES (With their own Standings) ---
        races: [
          {
            id: "sprint",
            name: "Sprint Race",
            // RACE STANDING
            raceStandings: [
              { pos: 1, driver: "Max Verstappen", team: "Red Bull", time: "24:00.000", pts: 8 },
              { pos: 2, driver: "Charles Leclerc", team: "Ferrari", time: "+2.4s", pts: 7 },
            ]
          },
          {
            id: "feature",
            name: "Feature Race",
            // RACE STANDING
            raceStandings: [
              { pos: 1, driver: "Max Verstappen", team: "Red Bull", time: "1:30:00.000", pts: 25 },
              { pos: 2, driver: "Sergio Perez", team: "Red Bull", time: "+5.4s", pts: 18 },
            ]
          }
        ]
      }
    ]
  },
  // ... other seasons
};