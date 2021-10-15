# proj_NodeMailer

_Source:_ https://github.com/Ninni-cfm/proj_NodeMailer
_Demo:_ https://young-falls-55916.herokuapp.com/

---

## **JS Express CodeFlow Übung lev3_2: Nodemailer**

### **Aufgabenstellung**

Hier erstellen wir eine E-mail Bestätigung nach einer Registration auf unserer Website. Diese soll automatisch an den neuen Benutzer mit einem Aktivierungslink versendet werden. Der Aktivierungslink dient zur Bestätigung der Identität und erst danach ist die Registrierung erfolgreich.

Sobald die Identität bestätigt wurde, wechselt der Status von "ausstehend" zu "aktiv".
Es mag wie eine Menge erscheinen, aber lass uns in den Vorgang in kleine Schritte unterteilen!

---

### Intro

Fast jedes Mal, wenn wir uns bei einer Web-App registrieren, müssen wir unser Konto bestätigen, indem wir auf einen Aktivierungslink klicken, der an unsere E-Mail gesendet wurde. Dies ist ein guter Weg, um zu vermeiden, dass sich Benutzer mit gefälschten Daten registrieren. In diesem Beispiel werden wir genau das Gleiche tun - ein Registrierungsformular erstellen, die es dem Betreiber ermöglicht, über den Status von standardmäßig auf "Pending Confirmation" (ausstehende Bestätigung) zu setzen und erst nach Aktivierung mit dem E-Mail-Verifizierungscode auf den Status "aktiv" aktualisiert wird.

Wir werden hierfür [Nodemailer](https://nodemailer.com/about/) verwenden! (dies ist der Link, der euch zur Dokumentation führt, also machen wir weiter und öffnen sie).

Wie wir in der Dokumentation herauslesen können, sendet dieses Paket E-Mails von unserer App.

**Erstelle ein neues G-Mail Benutzerkonto.**

Um das Senden von E-Mails aus unserer App einzurichten, empfehlen wir Euch, ein neues Gmail-Konto zu erstellen.

Nodemailer wird sich bei diesem E-Mail-Konto anmelden und die E-Mails von unserer App aus versenden. Dazu müssen wir die externe Anwendung autorisieren und mit unseren Kontodaten anmelden.

Besucht diese Website, um “Less secure app” zuzulassen: https://myaccount.google.com/lesssecureapps

---

## 1 | APP Setup

In den nächsten Schritten erstellen wir alle Dateien, die ihr benötigt. Bis jetzt habt ihr einige grundlegende Einstellungen in der index.js vorgenommen, aber diese sind nicht genug. Wie ihr euch erinnern könnt, müssen wir einige Pakete (einschließlich express) in der Datei package.json haben, um sie in unsere App zu bekommen. Beginnen wir also mit der Auflistung der Schritte:

-   Lasst uns alle Abhängigkeiten installieren, die wir benötigen, um diese App erfolgreich auszuführen: npm install express ejs nodemailer dotenv.
-   nodemon ist als Dev-Abhängigkeit installiert (unsere App ist nicht davon abhängig, aber es hilft uns im Entwicklungsprozess), welches bedeutet, dass wir nodemon verwenden können, um die App mit: npm run dev zu starten.
-   Innerhalb der Datei index.js benötigen wir nun nodemailer.

    `const nodemailer = require('nodemailer');`

## 2 | Express Setup

Lasst uns nun einen Ordner views erstellen. Zu diesem Zeitpunkt sollten wir nun die folgende Struktur von Ordnern und Dateien haben:
Wie wir sehen können, haben wir in der index.js alle Pakete vorhanden, die wir jetzt brauchen für:

```
    const express = require('express');
    const nodemailer = require('nodemailer');
```

Wir sind nun startklar. Öffnen wir die nodemailer-Dokumentation und beginnen wir unsere Reise!

## 3 | Register

Erstellt ein Registrierungsformular mit folgende Eingaben: Vorname, Nachname, E-Mail und Passwort. \<form action=”/new” method=”post”> ...\</form>

Wenn der Benutzer auf die Schaltfläche "Registrieren" klickt:

1.  erstellen wir mit post in index.js (‘/new’)
2.  wir werden das folgende Objekt in users.json speichern, wenn die E-Mail nicht in unserer Json-Datei vorhanden ist. Wenn sie existiert, leiten wir zu /login um

    ```
        {
            id:...,
            firstName:...,
            lastName:...,
            email:...,
            confirmationCode:...,
            password:...,
            active:’pending’
        }
    ```

    Erzeuge die Id und den confirmationCode mit [uuid](https://www.npmjs.com/package/uuid)

    Bonus: Um das Passwort zusätzlich zu sichern, könnt ihr folgendes [Package](https://www.npmjs.com/package/bcrypt) verwenden.

3.  wir senden eine Aktivierungs-E-Mail an die Benutzer-E-Mail.
    In dieser E-Mail sollte die folgende Url angeben werden:
    http://localhost:YOURPORT/confirm/THE-CONFIRMATION-CODE-OF-THE-USER
    Zum Senden der E-Mail verwenden wir nodemailer service

    ```
    const transporter = nodemailer.createTransport({
        service: 'gmail', // no need to set host or port etc.
        auth: {
            user: process.env.CLIENT_EMAIL,
            pass: process.env.CLIENT_PASS
        }
    });
    ```

    Um zu vermeiden, dass unsere E-Mail und unser Passwort öffentlich werden, wollen wir sie nicht hinzufügen und übertragen. Wir werden dafür ein Paket namens dotenv verwenden. Dieses Paket wird ganz am Anfang von app.js importiert. Alles, was noch zu tun ist, ist das Hinzufügen eurer Schlüssel in der .env file. Erstellt also eine .env file und füge dort die folgenden Zeilen ein, wobei ihr den Text durch Ihre Anmeldedaten ersetzen müsst.

    ```
    CLIENT_EMAIL=your client Email goes here
    CLIENT_PASS=your client Pass goes here
    ```

    ⚡ Die .env wird in der .gitignore file referenziert, Ihr seid also sicher!

4.  Umleitung auf /login

🔥 Das Styling sollte das letzte sein, worauf ihr euch konzentriert. Funktionalität geht vor! 🙏🏻

## 4 | Bestätigungs Email

Wenn der Benutzer seine Identität mit der Bestätigungs-Url aus der erhaltenen E-Mail bestätigt, ändern wir seinen Status von "ausstehend" auf "aktiv".

Um dies zu tun, sollten wir die Route zu '/confirm/THE-CONFIRMATION-CODE-OF-THE-USER' anpassen.

Da der ConfimationCode für jeden Benutzer einzigartig ist, können wir den Status des Benutzers in unserer json-Datei aktualisieren.

## 5 | login

Die Login-Seite sollte ein Formular mit zwei Eingaben haben, E-Mail und Passwort:

-   wenn die E-Mail nicht existiert, leiten wir auf die Route '/register' um
-   wenn das Passwort nicht mit dem vorhandenen Passwort in unserer json übereinstimmt, leiten wir auf die Route '/login' um
    (Bonus: verwendet das Flash-Paket, um einen Fehler anzuzeigen)
-   wenn die E-Mail und das Kennwort übereinstimmen, der Status aber noch auf "Ausstehend" steht, können wir eine Meldung anzeigen:

        “Bitte bestätigen Sie Ihre Mail”
        Bonus:
        “Sie haben keine E-Mail erhalten, klicken Sie hier, um sie erneut zu versenden”

-   wenn die E-Mail und das Passwort übereinstimmen, leitet ihr den Benutzer zu /secret um

## 6 | Secret.ejs

Auf einer geheimen Seite steht: “You are now in da club 😎🥳”
