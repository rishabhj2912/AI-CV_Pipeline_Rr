FROM node:10-alpine

WORKDIR .


RUN apk add --no-cache python python-dev python3 python3-dev \
    linux-headers build-base bash git ca-certificates && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools==45 && \
    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi && \
    rm -r /root/.cache


COPY . ../Components/edge_detection    
RUN pip3 install -r './app/requirements.txt' 
# RUN pip3 install numpy
# RUN pip3 install opencv-python

RUN npm install

EXPOSE 8080
CMD [ "node", "index.js" ]