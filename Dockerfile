FROM public.ecr.aws/docker/library/node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY certs ./certs

RUN apk add --no-cache curl

CMD ["node", "src/main.js"]
