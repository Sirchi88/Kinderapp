# Gira Programmierung

Assistent, der aus einem (gesprochenen) Use Case eine Schritt-für-Schritt-Anleitung für den **Gira X1 / Gira Projekt Assistent (GPA)** und, wo sinnvoll, für die **ETS** erzeugt. Abgedeckt sind Logiken, Szenen und Zeitschaltuhren.

## Einrichtung (ca. 5 Minuten)

1. Auf **claude.ai** (oder in der Claude-App) → **Projekte** → **Neues Projekt** → Name: `Gira Programmierung`.
2. Den Inhalt von [`PROJEKT-ANWEISUNGEN.md`](PROJEKT-ANWEISUNGEN.md) unter **Projektanweisungen** einfügen.
3. Unter **Projektwissen** hochladen (je mehr, desto genauer):
   - **Gruppenadressen aus der ETS**: In der ETS → Gruppenadressen → Rechtsklick → **Gruppenadressen exportieren** (CSV). Alternativ die `.knxproj`.
   - **Screenshots aus dem GPA**: die Bausteinbibliothek des Logikeditors (alle Kategorien aufgeklappt) sowie die Dialoge für Szene und Zeitschaltuhr. Damit stimmen die Bausteinnamen exakt mit deiner Version überein.
   - Optional: das Gira-X1-Handbuch / die GPA-Hilfe als PDF.
4. In der **Handy-App** das Projekt öffnen, aufs **Mikrofon** tippen und den Use Case diktieren.

## Beispiel-Eingaben

- „Wenn im Flur nach Sonnenuntergang Bewegung erkannt wird, soll das Licht auf 30 Prozent gehen und nach 5 Minuten aus. Tagsüber nichts.“
- „Rollläden im Wohnzimmer bei Sonnenuntergang runter, aber nur wenn die Terrassentür zu ist.“
- „Eine Szene ‚Fernsehen‘: Wohnzimmer-Licht 20 Prozent, Stehlampe an, Rollläden runter, per Taster und App aufrufbar.“
- „Heizung werktags um 22 Uhr auf Nachtabsenkung, am Wochenende erst um 23 Uhr.“

## GPA-Version herausfinden

Im Projekt Assistenten: **Hilfe → Info** (bzw. das „?“-Menü).

## Direkt im GPA/ETS anlegen?

- Der GPA hat keine öffentliche Schnittstelle und das `.gpa`-Format ist nicht dokumentiert. Logiken lassen sich daher nicht automatisiert in die Datei schreiben.
- Die **Gira IoT REST API** des X1 kann Datenpunkte lesen und schalten, aber keine Logiken anlegen.
- Die **ETS** lässt sich nur lesend nutzen (Export/`.knxproj`).
- Möglich wäre „Computer Use“ über die Claude-Desktop-App auf dem Windows-PC (Claude klickt im GPA). Das ist experimentell und geht nur mit Backup.
