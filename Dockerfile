FROM node:18

# Create app directory
WORKDIR /app

RUN rm -fr node_modules

# Expose port 3000 and build + start application
EXPOSE 3000
CMD ["/bin/bash", "-c", "npm install; npm run dev"]

