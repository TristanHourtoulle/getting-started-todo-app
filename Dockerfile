###################################################
# Stage: base
# 
# This base stage ensures all other stages are using the same base image
# and provides common configuration for all stages, such as the working dir.
###################################################
FROM node:22 AS base
WORKDIR /usr/local/app

################## CLIENT STAGES ##################

###################################################
# Stage: client-base
#
# This stage is used as the base for the client-dev and client-build stages,
# since there are common steps needed for each.
###################################################
FROM base AS client-base
COPY client/package.json client/package-lock.json ./
RUN npm install
COPY client/.eslintrc.cjs client/index.html client/vite.config.ts ./
COPY client/tsconfig.json client/tsconfig.app.json client/tsconfig.node.json ./
COPY client/public ./public
COPY client/src ./src

###################################################
# Stage: client-dev
# 
# This stage is used for development of the client application. It sets 
# the default command to start the Vite development server.
###################################################
FROM client-base AS client-dev
CMD ["npm", "run", "dev"]

###################################################
# Stage: client-build
#
# This stage builds the client application, producing static HTML, CSS, and
# JS files that can be served by the backend.
###################################################
FROM client-base AS client-build
RUN npm run build




###################################################
################  BACKEND STAGES  #################
###################################################

###################################################
# Stage: backend-base
#
# This stage is used as the base for the backend-dev and test stages, since
# there are common steps needed for each.
###################################################
FROM base AS backend-dev
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend/tsconfig.json backend/jest.config.js ./
COPY backend/spec ./spec
COPY backend/src ./src
CMD ["npm", "run", "dev"]

###################################################
# Stage: test
#
# This stage runs the tests on the backend. This is split into a separate
# stage to allow the final image to not have the test dependencies or test
# cases.
###################################################
FROM backend-dev AS test
RUN npm run test

###################################################
# Stage: backend-build
#
# This stage compiles the TypeScript backend into JavaScript. The noEmit
# flag from tsconfig.json is overridden so tsc produces output in dist/.
###################################################
FROM test AS backend-build
RUN npx tsc --noEmit false --outDir dist

###################################################
# Stage: final
#
# This stage is intended to be the final "production" image. It sets up the
# backend and copies the built client application from the client-build stage.
#
# It pulls the package.json and package-lock.json from the backend-build
# stage to ensure that both tests and compilation ran successfully.
###################################################
FROM base AS final
ENV NODE_ENV=production
COPY --from=backend-build /usr/local/app/package.json /usr/local/app/package-lock.json ./
RUN npm ci --production && \
    npm cache clean --force
COPY --from=backend-build /usr/local/app/dist ./dist
COPY --from=client-build /usr/local/app/dist ./dist/static
EXPOSE 3000
CMD ["node", "dist/index.js"]