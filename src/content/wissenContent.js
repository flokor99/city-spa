export const interpretationNotes = [
  {
    title: "Funktionsprinzip",
    text: "Das Tool basiert auf KI-gestützter Analyse und Textgenerierung. Ergebnisse sind nicht deterministisch und können bei gleicher Fragestellung variieren.",
  },
  {
    title: "Datenbasis",
    text: "Die Ergebnisse basieren auf öffentlich einsehbaren Informationen. Ziele, Strategien und Prioritäten von Städten sind daher nur begrenzt belastbar ableitbar.",
  },
  {
    title: "Aktualität",
    text: "Die Ausgaben spiegeln den Stand der zum Analysezeitpunkt verfügbaren Informationen wider. Veränderungen nach diesem Zeitpunkt werden nicht automatisch berücksichtigt.",
  },
  {
    title: "Einordnung & Kommunikation",
    text: "Die Ergebnisse dienen als Orientierungs- und Diskussionsgrundlage. In der Kommunikation, insbesondere gegenüber Städten, ist eine vorsichtige und kontextualisierte Darstellung erforderlich.",
  },
  {
    title: "Vergleichbarkeit",
    text: "Vergleiche zwischen Städten sind nur eingeschränkt möglich, da Datenverfügbarkeit, Transparenz und Dokumentationsgrad stark variieren.",
  },
  {
    title: "Kein Ersatz für Expertise",
    text: "Das Tool ersetzt keine fachliche Prüfung, keine Vor-Ort-Kenntnis und keine verbindliche Bewertung. Kritische Aussagen sollten geprüft werden.",
  },
];

export const presentations = [
  {
    id: "intro",
    title: "City Profiler – Überblick",
    description: "Foresight Academy – Future Cities Präsentation",
    fileUrl:
      "/docs/presentations/Cities_of_the_Future_Scenario_Documentation_Draft20250228.pdf",
    previewUrl: "/assets/previews/Future%20Cities%20Titelbild.png",
  },
];

export const faqItems = [
  {
    q: "Ich habe eine Frage im Chat gestellt, bekomme aber nur die Meldung, dass ein Output erstellt wird. Warum?",
    a: "Diese Version des City Profilers ist ein Prototyp. Antworten, die länger als ca. 30 Sekunden für die Generierung benötigen, können aktuell abbrechen. In diesem Fall wird der Prozess nicht sauber abgeschlossen und es erscheint lediglich die Meldung, dass ein Output erstellt wird. Stelle die Frage in diesem Fall kürzer oder versuche es erneut.",
  },
  {
    q: "Wo finde ich die Quellen und vertiefenden Informationen zu meinem Output?",
    a: "Quellenangaben sowie die vom Profiler zusammengetragenen Hintergrundinformationen sind im Anhang (Annex) des jeweiligen Outputs dokumentiert.",
  },
];


export const annexItems = [

  {
    id: "glossar",
    title: "Anhang – Glossar",
    description: "Begriffe und Abkürzungen.",
    fileUrl: "/docs/annex/glossar.pdf",
  },
  {
    id: "criteria-xlsx",
    title: "Anhang – Kriterien & Bewertungslogik (Excel)",
    description: "Tabellarische Detailübersicht der Kriterien zur Stadteinordnung.",
    fileUrl: "/docs/annex/city-profiler_kriterien.xlsx",
  },
];
