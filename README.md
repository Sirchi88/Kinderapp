# 🏡 Sirchhausen – das Familie-Sirch-Spiel

Spiel-, Beschäftigungs- und Bewegungs-App für Malia (4) und Nele (3).
Läuft als Web-App auf iPhone und iPad (Querformat), auch offline.

Das ganze Konzept steht in [`docs/KONZEPT.md`](docs/KONZEPT.md).

## Stand: Etappe 1 – Fundament
- **Wer spielt heute?** Kinder-Auswahl für Malia & Nele
- **Figuren-Editor** mit Spiegel: Haut, Frisur, Haarfarbe, Augen, Oberteil, Hose/Rock, Schuhe, Schmuck & Extras (Krone, Feenflügel, Schleife …)
- **19 Kuscheltiere**, u. a. Tukan, Bär, Wildschwein, Affe, Pavian, Rassel, Gelbi, Puppi, Einhorn, Allgäuer Kuh
- **Dorf Sirchhausen** mit eurem Haus, Mama & Papa, Bailey, Schildkröte, beiden Großelternpaaren, Kühen und Allgäuer Bergen. Fast alles reagiert auf Antippen.
- **Bewegungspausen**: Gerät ablegen (Bewegungssensor), Tanz-, Tier-, Sport- und Suchaufgaben, Stopptanz, Mitzählen, Sterne
- **Tageslimit** mit Schlaf-Bildschirm
- **Sternenglas** mit echten Belohnungen
- **Elternbereich** (Schloss 1,5 s gedrückt halten + PIN)
- Selbst komponierte Musik und Geräusche, deutsche Sprachausgabe

## Lokal starten
```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```
Keine Installation, kein Build-Schritt. `dev/gallery.html` zeigt alle Figuren und Kuscheltiere.

## Auf dem iPad/iPhone
Über HTTPS öffnen (z. B. GitHub Pages) → Teilen → „Zum Home-Bildschirm“.
Bei neuen Versionen in `sw.js` die `VERSION` erhöhen.
