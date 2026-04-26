# ใช้ Node 20 ตัวเต็ม (บอกลาบั๊ก npm)
FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Accept and expose the build arg as an env var during build
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

RUN npm run build
CMD ["npm", "start"]