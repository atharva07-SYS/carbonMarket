FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the API port
EXPOSE 5000

# Start the backend via ts-node directly
# Note: In a true prod env you would compile TS via `npm run build` 
# and then run `node dist/index.js`, but this guarantees it works out of the box with your current setup.
CMD ["npx", "ts-node", "src/index.ts"]
