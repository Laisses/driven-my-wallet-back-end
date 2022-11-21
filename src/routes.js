import * as middlewares from "./middlewares.js";
import * as handlers from "./handlers.js";

export const routes = (app, db) => {
    app.use(middlewares.collections(db));

    app.post("/sign-up", middlewares.asyncError(handlers.signUp));
    app.post("/sign-in", middlewares.asyncError(handlers.signIn));

    app.use(middlewares.authenticate);

    app.get   ("/transactions",                                            middlewares.asyncError(handlers.listTransactions));
    app.get   ("/transactions/:id",                                        middlewares.asyncError(handlers.singleTransaction));
    app.post  ("/transactions",     middlewares.validateTransactionSchema, middlewares.asyncError(handlers.newTransaction));
    app.delete("/transactions/:id",                                        middlewares.asyncError(handlers.removeTransaction));
    app.put   ("/transactions/:id", middlewares.validateTransactionSchema, middlewares.asyncError(handlers.updateTransaction));
};