# Sophias Gartenpost und Reizpost bei Nacht

Sophia hat Nürnberg gewählt. Die neue Startseite lädt sie für das ursprünglich geplante Wochenende am 5. und 6. Dezember 2026 zum gemeinsamen Einpflanzen ihrer Frühlingszwiebeln und anschließend zum Essen ein. Augsburg ist die äußere Grenze für die Fahrt. Die persönliche Widmung stellt die gemeinsame Zeit in den Mittelpunkt.

## Seiten und Interaktion

| Zeitpunkt oder Aktion | Sichtbares Ergebnis |
| --- | --- |
| Ab Sonnenaufgang in Rosenheim | „Sophias Gartenpost“, Titel „Lauch gehabt!“, Tagesillustration, Schaltfläche „Komm zum Pflanzen vorbei“ |
| Ab Sonnenuntergang in Rosenheim | „Reizpost bei Nacht“, Titel „Vom Beet ins Blaue.“, Nachtillustration, Schaltfläche „Das klingt schön“ |
| Eine der beiden Schaltflächen anklicken | Eigene Adresse unter `/antwort/`. Roséfarbene Postkarte „Heute grüßt das Beet.“ mit Zusage, Gartenillustration, Wetterkarte und persönlicher Widmung. |
| Antwort direkt öffnen oder neu laden | Dieselbe illustrierte Zusage. Der Rücklink führt zur Einladung. Der Klick löst ausschließlich die Navigation aus. |
| „Die erste Reisepost“ öffnen | Die ursprüngliche Reiseauswahl inklusive ihrer lokalen Speicherung unter `/reisepost/`. |

Die Startseite funktioniert als statisches HTML. JavaScript berechnet vor Ort die astronomische Ausgabe mit SunCalc, der Uhrzeit des Geräts und einem festen Standort in Rosenheim. Die Berechnung verwendet den Kalendertag in Europe/Berlin. Bei offenem Tab wird zum nächsten Ereignis umgeschaltet. Bei Rückkehr aus dem Hintergrund wird erneut berechnet. Ohne JavaScript ist die Tagespost lesbar.

## Gestaltung und Unterseiten

| Ansicht | Route | Gestaltung und Verhalten |
| --- | --- | --- |
| [Tag](ansichten/tag.webp) | `/` | Creme, Waldgrün und Zinnoberrot. Zwei Gartenhelfer tragen eine große Frühlingszwiebel. „Komm zum Pflanzen vorbei“ öffnet die Zusage. |
| [Nacht](ansichten/nacht.webp) | `/` | Indigo und Apricot. Ein beleuchteter Tisch im nächtlichen Garten. „Das klingt schön“ öffnet dieselbe Zusage. |
| [Zusage am Desktop](ansichten/zusage.webp) · [am Handy](ansichten/zusage-mobil.webp) | `/antwort/` | Roséfarbenes Papier mit Schmetterlingsmarke. Links stehen der Gruß und die gerahmte Illustration, rechts die Wetterkarte. Auf dem Handy folgen diese Elemente untereinander. Es schließen sich die Essenseinladung und Ricardos persönliche Widmung an. |
| [Erste Reisepost](ansichten/reisepost.webp) | `/reisepost/` | Ursprüngliche Geburtstagsausgabe mit den Reiseoptionen Wien und Nürnberg. Über die Fußzeilen der Einladung und Zusage erreichbar. |

Die Ansichten sind Browseraufnahmen der gebauten Seiten. Die Zusage ist zu jeder Tageszeit roséfarben. Ihr Text beantwortet Sophias Ja: „Liebste Sophia, ja, dann komme ich zum Pflanzen vorbei.“ Vor der Ortswahl zeigt sie eine ausdrücklich als Beispiel gekennzeichnete illustrierte Karte. Nach der Ortswahl erscheint an ihrer Stelle die bedienbare Wetterkarte. Die Widmung auf Einladung und Zusage lautet:

> Nürnberg läuft uns nicht weg. Hauptsache, ich darf ein paar Wimpernschläge Zeit mit dir verbringen und mit dir zusammen sein 💕

## Ort und Gartenwetter

Der Sonnenstand bezieht sich immer auf Rosenheim. Beim Öffnen ist die Gartenadresse leer. Erst nach Absenden der Suche erhält Photon den eingegebenen Suchtext. Die Person wählt einen der Treffer ausdrücklich aus. Die Adresse gilt für die aktuelle Seitenansicht. Eine neue Eingabe verwirft die Auswahl und ihre Wetterdaten. Bei fehlenden Treffern oder einem Dienstfehler kann die Suche wiederholt werden.

Nach der Auswahl zeigt die Karte Modellwerte von Open-Meteo am gewählten Garten und an drei umliegenden Vergleichspunkten auf einer OpenStreetMap-Grundkarte. Der Ebenenwähler wechselt zwischen Bodentemperatur in 6 cm Tiefe, Lufttemperatur in 2 m Höhe und stündlichem Niederschlag. Sechs lokale Termine um 9, 12 und 15 Uhr stehen zur Auswahl, sobald sie im Vorhersagezeitraum liegen und noch bevorstehen. Bereits vergangene Termine entfallen.

**Regel für einen möglichen Pflanztermin.** Am gewählten Zeitpunkt müssen die Luft und der modellierte Boden über 0 °C liegen, die stündliche Niederschlagsmenge bei 0 mm und das Luftminimum von 18 Uhr bis einschließlich 8 Uhr am folgenden Morgen über 0 °C. Unter den passenden Terminen wird der mit dem wärmsten Boden hervorgehoben, bei Gleichstand der frühere. Das ist eine praktische Vergleichsregel für bewurzelte Jungpflanzen. Die Sorteneignung, tatsächlicher Bodenfrost und Staunässe müssen vor Ort geprüft werden. Die Seite verspricht keine optimale Wachstumstemperatur.

Fehlende Werte ergeben keine positive Empfehlung. Vor dem Vorhersagehorizont erscheint ein Hinweis. Bei einem API-Fehler ist ein erneuter Versuch möglich. Nach dem Wochenende gibt es keine aktuelle Empfehlung für den vergangenen Termin. Die Einladung bleibt lesbar.

## Veröffentlichung und Abnahme

Astro erzeugt drei statische Seiten. `npm ci`, `npm run build:pages` und `npm run test:pages` bauen und prüfen die eingecheckte Pages-Ausgabe unter `docs/`. Relative Assetpfade erlauben die Ansicht der gebauten Seiten unter einer Commit-URL. Die bestehende Pages-Konfiguration mit CNAME kann den Stand nach Freigabe auf dem Veröffentlichungsbranch übernehmen.

Für die Abnahme beide Tagesgrenzen prüfen, beide Antwortlinks auch auf dem Telefon öffnen, zwischen Kartebenen wechseln und eine fehlende Vorhersage simulieren. Die Antwortseite muss direkt erreichbar bleiben.

## Quellen

- [SunCalc – Sonnenaufgang und Sonnenuntergang](https://github.com/mourner/suncalc)
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- [OpenStreetMap-Kartengrundlage](https://www.openstreetmap.org/copyright)
- [Gartenakademie Rheinland-Pfalz – Frühlingszwiebeln im Hausgarten](https://www.hortipendium.de/Fr%C3%BChlingszwiebeln_im_Hausgarten)
- [Bayerische Gartenakademie und Hochschule Weihenstephan-Triesdorf – Frühlingszwiebel](https://www.garten-klima.de/pluginfile.php/191/mod_folder/content/0/Zwiebelgew%C3%A4chse/Fr%C3%BChlingszwiebel.pdf)
