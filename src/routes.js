import * as middlewares from "./middlewares.js";
import * as handlers from "./handlers.js";
import * as schemas from "./schemas.js";


export const routes = (app, db) => {
    app.use(middlewares.collections(db));

    app.post("/sign-up",   middlewares.validate(schemas.newUser), middlewares.asyncError(handlers.signUp));
    app.post("/sign-in",   middlewares.validate(schemas.user),    middlewares.asyncError(handlers.signIn));

    app.use(middlewares.authenticate);

    app.delete("/session", middlewares.asyncError(handlers.removeSession));


    app.get   ("/transactions",                                                middlewares.asyncError(handlers.listTransactions));
    app.get   ("/transactions/:id",                                            middlewares.asyncError(handlers.singleTransaction));
    app.post  ("/transactions",     middlewares.validate(schemas.transaction), middlewares.asyncError(handlers.newTransaction));
    app.delete("/transactions/:id",                                            middlewares.asyncError(handlers.removeTransaction));
    app.put   ("/transactions/:id", middlewares.validate(schemas.transaction), middlewares.asyncError(handlers.updateTransaction));
};