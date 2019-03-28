const Status = {
    400: {
        fr: "La requête est incorrecte (Erreur 400).",
        en: "Bad Request (Error 400)."
    },
    401: {
        fr: "Vous devez être authentifié pour effectuer cette action (Erreur 401).",
        en: "You should be authentified to send this request (Error 401)."
    },
    403: {
        fr: "Vous n'êtes pas autorisé à effectuer cette requête (Erreur 403).",
        en: "You are not authorized to send this request (Error 403)."
    },
    404: {
        fr: "La ressources demandée n'est pas disponible (Erreur 404).",
        en: "The requested resource could not be found (Error 404)."
    }
};

export default Status;