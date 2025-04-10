const APP_KEY = '032pg35p3awd4o9'; // Remplace par ta clé d'application
    let FILE_PATH = "/mon_fichier.json"; // Remplace par le nom de ton fichier json
    const REDIRECT_URI = 'https://loureinak.github.io/dropboxApiTest/';  // Remplace par l'URL de redirection configurée
    let dbx;
    let accessToken;
    let jsonData; // sert de buffer pour le fichier json

    // Fonction pour authentifier l'utilisateur via OAuth
    function authenticate() {
      // Créer l'URL d'authentification OAuth pour Dropbox
      const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
      window.location.href = authUrl;  // Redirige l'utilisateur vers l'URL d'authentification
    }

    // Vérifier l'URL de redirection après l'authentification pour récupérer le token d'accès
    function checkAuthentication() {
      const urlParams = new URLSearchParams(window.location.hash.substring(1)); // Après le # dans l'URL
      accessToken = urlParams.get('access_token');

      if (accessToken) {
        dbx = new Dropbox.Dropbox({ accessToken: accessToken });
        document.getElementById('authBtn').style.display = 'none';
        document.getElementById('readBtn').style.display = 'inline-block';
        document.getElementById('writeBtn').style.display = 'inline-block';
        document.getElementById('addBtn').style.display = 'inline-block';
        document.getElementById('RemoveBtn').style.display = 'inline-block';
        document.getElementById('ModifyBtn').style.display = 'inline-block';
        document.getElementById('ResetBtn').style.display = 'inline-block';

        readJsonFile();

        /*
        dbx.filesListFolder({ path: '' }) // Liste les fichiers dans le dossier racine
          .then(function (response) {
            console.log("fichiers sur le drive :", response.result.entries);
          })
          .catch(function (error) {
            console.error('Erreur lors de la récupération des fichiers :', error);
          });
        */
      }
    }

    // Lire le fichier JSON depuis Dropbox
    function readJsonFile() {
      dbx.filesDownload({ path: FILE_PATH })
        .then(function (response) {
          response.result.fileBlob.text().then(function (fileContents) {
            try {
              jsonData = JSON.parse(fileContents);
              console.log("file read :", jsonData);
            } catch (err) {
              console.error("Erreur de parsing JSON :", err.message);
            }
            // traitement
            document.getElementById('output').textContent = JSON.stringify(jsonData, null, 2);
          });
        })
        .catch(function (error) {
          if (error.status === 409) {
            console.error('Le fichier n\'existe pas sur Dropbox.');
          } else {
            console.error('Erreur lors de la lecture du fichier :', error);
          }
        });
    }

    // Envoyer le fichier JSON à Dropbox
    function writeJsonFile() {
      console.log("file to write :", jsonData);
      fileContent = JSON.stringify(jsonData, null, 2);
      dbx.filesUpload({
        path: FILE_PATH,
        contents: fileContent,
        mode: { '.tag': 'overwrite' }
      })
        .then(function (response) {
          console.log('Fichier mis à jour avec succès !');
          readJsonFile();
        })
        .catch(function (error) {
          console.error('Erreur lors de la mise à jour du fichier :', error);
        });
    }

    // Ajouter un élément au buffer
    function addBookmark() {
      const name = "name"; // get from a form
      const url = "url"; // get from a form
      const id = calculateNewId();
      const newObject = {
        "id": id,
        "name": name,
        "url": url
      }
      jsonData.push(newObject);
      console.log("file modified in buffer :", jsonData);
    }

    // Supprimer un élément du buffer
    function removeBookmark(id) {
        for (let index in jsonData) {
          if (jsonData[index].id == id) {
            jsonData.splice(index, 1);
            console.log("Element removed from buffer :", jsonData);
            return 1;
          }
        }
        console.log("Element absent du fichier JSON");
        return 0;
    }

    // Modifier un élément du buffer
    function modifyBookmark(id) {
      if (!removeBookmark(id)) {
        console.log("Error modfiying bookmark : does not exist");
        return;
      }
      const name = "eman"; // get from a form
      const url = "lru"; // get from a form
      const newObject = {
        "id": id,
        "name": name,
        "url": url
      }
      jsonData.push(newObject);
      console.log("Element modified in buffer :", jsonData);
    }

    // Set the buffer to a default value
    function resetFile() {
      jsonData = [
        {
          "id": 0,
          "name": "Youtube",
          "url": "https://youtube.com"
        }
      ];
      console.log("Buffer remis à la valeur par défaut :", jsonData);
    }

    // Retourne un id correspondant au premier entier non utilisé
    function calculateNewId() {
      let id = 0;
      while (true) {
        let unique = true;
        for (let i in jsonData) {
          const object = jsonData[i];
          if (id == object.id) {
            unique = false;
            break;
          }
        }
        if (unique) return id;
        else id++;
      }
    }

    // Ajout des événements
    document.getElementById('authBtn').addEventListener('click', authenticate);
    document.getElementById('readBtn').addEventListener('click', readJsonFile);
    document.getElementById('writeBtn').addEventListener('click', writeJsonFile);
    document.getElementById('addBtn').addEventListener('click', addBookmark);
    document.getElementById('RemoveBtn').addEventListener('click', (event) => {removeBookmark(event.target.dataset.bookmarkId)});
    document.getElementById('ModifyBtn').addEventListener('click', () => {modifyBookmark(1)});
    document.getElementById('ResetBtn').addEventListener('click', resetFile);
    
    // Vérifier si l'utilisateur est déjà authentifié quand le DOM est chargé
    document.addEventListener('DOMContentLoaded',checkAuthentication);
