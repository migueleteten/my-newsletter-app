const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Lista de correos electrónicos de los administradores
const adminEmails = ['miguel@arcasl.es', 'jaime@arcasl.es', 'josemaria@arcasl.es'];

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  (token, tokenSecret, profile, done) => {
    // Lógica para verificar si el usuario pertenece al dominio @arcasl.es y si es administrador
    const email = profile.emails[0].value;
    const domain = email.split('@')[1];

    if (domain === 'arcasl.es') {
        // Verificar si el correo pertenece a un administrador
        if (adminEmails.includes(email)) {
            profile.isAdmin = true;  // Marcar el perfil como administrador
        } else {
            profile.isAdmin = false; // Marcar el perfil como usuario normal
        }
        return done(null, profile);
    } else {
        return done(null, false, { message: 'No tiene permisos para acceder.' });
    }
  }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});
