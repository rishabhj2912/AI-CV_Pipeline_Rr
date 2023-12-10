# Data Foundation Systems

## Software Requirements & Design Specification

## AI / CV Pipeline (images)



**Project Category:**  **AI / CV Pipeline**



![Shape2](RackMultipart20230206-1-e2q3zn_html_237499165a11f2b9.gif)

### 1. Introduction

Building an Artificial Intelligence (AI) / computer vision (CV) project for autonomous driving, medical imaging or robotics, etc can be difficult and will require tracking, logging, analyzing and micromanaging multiple tasks. The enormous volume of data and multiplicity of iterations in the project necessitates the requirement of a proper scalable AI/CV Pipeline. This aids teams in creating, managing, and maintaining the constant inflow of high-quality training data within their computer vision pipelines.

### 2. Project Description:

- AI Model execution/ Computer Vision pipeline setup for Images
- JSON based configuration setup
- Stepwise execution, logging and tracking.

### 3. Instructions to Run

1) Clone the repository.
2) Modify .env files according to your requirement:-

              * Change port number of the services and end points according to your need.
              * Change RDS database credential such as host, username, password and port
              * Change MinIO credential such as endpoints, port, accesskey, secretkey, image bucket name, component bucket name.
              * Secret_key and token key
              
3) enter `npm install` in every services.
4) Start the heartbeat service by entering following commands:-

              * cd Headtbeat
              * npm start
              
5) Run Bootstrap service in a new terminal using following commands:-

              * cd Bootstrapper
              * python3 bootstrapper.py
 

### 4. Requirements:

**4.1 Functional Requirements**

  - **A. AI / Components:**

    The application must provide great performing computer vision tools that work well with C++ as well as Python. We will first analyze already existing open source tools like OpenCV, which is prebuilt with all the necessary techniques and algorithms to perform several image and video processing tasks. Further, the implementation of various necessary tools will be done to provide user with different data processing components.

  - **B. Authentication:**

    The platform will use HTTP connection and not HTTPS, thus we will encrypt passwords with a secure hashing algorithm such as SHA 256 with random nonce generated from the server. Instead the password was sent as plaintext in the request body which can be read by any attacker eavesdropping on the network.

    We suggest the following algorithm to prevent eavesdropping or replay attacks possible.

    - On the server
      - generate a few bits of random
      - send these bits (in clear text) to the client
    - On the client
      - generate a few random bits
      - concatenate password, the server's random bits and the client
      - random bits
      - generate hash of the above
      - submit random bits(in clear text) and hash to the server

  - **C. Input/Output Interface:**

    The pipeline should have clear input and output interfaces that allow for the seamless transfer of data between different stages of the pipeline. The pipeline should have well-defined protocols and standards for data transfer, such as APIs or file formats. This helps to ensure that the data is consistent and compatible between different stages of the pipeline, regardless of the technology or tools used. For any two consecutive components in the pipeline the output of the first component must be consistent with input of the next component.

  - **D. AI/CV pipeline Preview and Description**

    This will be a high-level overview of the AI/CV pipeline as a whole that will depict the various components that will be provided by the end-user through the configuration file. This preview will help the end-user to analyze and verify the working of pipeline.

  - **E. UI requirements**

    The user interface is key to application usability. The application will have a secure, convenient and extensible user interface. It would enable end-users to select tools for preprocessing of their images from the toolbox provided and then order them appropriately to set-up the pipeline. An efficient user-interface in terms of both speed and use for preprocessing their images will provide seamless experience to build AI/CV projects.

**4.2 Non-functional Requirements**

  - **A. Portability**

    This application will have the ability to be easily transferred to different hardware or software environments, which will be achieved through the use of docker. Docker will provide the ability to package and run the application in a loosely isolated environment called a container. The isolation and security allows it to run many containers simultaneously on a given host. Containers are lightweight and contain everything needed to run the application, so that there is no dependence on what is currently installed on the host.

  - **B. Scalability and Maintainability**
    
    The implementation of the application will be separated into independent modules. The internal details of individual modules will be hidden behind a public interface, making each module easier to understand, test and refactor independently of others The AI/CV pipeline should also be scalable and it must be able to handle increasing amounts of data and computational load without sacrificing performance. The key aspect for scalable systems is Data Scalability, Model Scalability, Computational Scalability, Cloud Scalability, Load Balancing, Optimal Resource Allocation.

  - **C. Reliability**

    The software system needs to consistently perform the specified functions without failure. The reliability requirements will consider needs regarding possible causes of AI/CV pipeline system failure, preventative actions or procedures necessary to avoid failure, failure classes, and reliability metrics. Running Docker will provide developers and admins a highly reliable, low-cost way to build the application.

  - **D. Performance**

    Performance is a key non-functional requirement of an AI/Computer Vision (CV) pipeline, as it directly impacts the quality and effectiveness of the results produced. Some specific performance-related considerations for an AI/CV pipeline include:

      - Processing Time: The time it takes for the AI/CV pipeline to process a given dataset or image should be within an acceptable range and should be efficient enough for the desired use case.
      - Accuracy: The accuracy of the predictions made by the AI/CV model, which should be evaluated using appropriate evaluation metrics and validated through testing.
      - Latency: The latency of the AI/CV pipeline, or the time it takes to produce a result after a request is made, should be low enough for the desired use case.
      - Throughput: The throughput of the AI/CV pipeline, or the number of requests it can handle per unit of time, should be high enough for the desired use case.
      - Resource Utilization: The AI/CV pipeline should be optimized to minimize the use of resources such as memory, CPU, and storage, to ensure efficient performance.

  - **E. Security**

    All the actors on the platform have predefined privileges. These actors are administrator, end user, moderator, and configurer. These roles define what are the responsibilities and capabilities of each of the users on the platform.

### 5. Scope:

**5.1 Project Scope**

Throughout the project, we can divide it into phases in order to have modular, scalable, and optimized versions of the previous phases. The following components will be delivered at the end :

  - Build AI/CV pipeline platform that enables users to add multiple Tools and provide input images to get the desired output.
  - Build multiple services as a part of our platform to provide diffirent functionalities. 
  - Provide an interactive and secure user interface that allows users to drag and drop required CV Tools and upload input images and requirements.
  - Integrated multiple AI/CV and Data Processing components that will be required throughout the life cycle of the services.
  - Deployment Scripts: Scripts for deploying the AI/CV pipeline in a production environment, including any necessary infrastructure setup and configuration.
  - Execution of the CV Tools and providing the final pre-processed data to the end user.
  - Project Report: A detailed report outlining the objectives, methodology, results, and conclusions of the project.

**5.2 Project out of scope:**

- Developing AI/CV models is not in the scope of the project.
- Execution of the model or providing final performance measures such as accuracy, precision , confusion matrix etc. is not in the scope of the project.

### 6. Architecture:

We propose a distributed platform that provides build, development and deployment functionalities for different AI/CV Tools. Most data becomes useless just seconds after 1s it is generated, so having the lowest latency possible between the data and the decision is critical. With this platform, we bring AI preprocessing capabilities to edge gateway. The platform consists of following microservices.


![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/System%20Architecture.jpg)

**Figure 1:** System Architecture


**6.1 UI Manager:**
  - Provides a CV components toolbar, with drag and drop functionality to create a customized CV pipeline
  - Provide a functionality for end user to choose components according to its requirement for the pipeline execution.
  - Redirects the requests to various services. 
  - Display final output to the end users after the execution of the pipeline.

**6.2 Component Manager:**
  - Users can upload Component as zip file. The contents of zip file should be as follows.
    ```
    └── Component
        ├── config.json
        ├── utility.py
        ├── requriements.txt
        └── src
            └── src.py
    ```
  - Wraps a node.js server with `/preprocess` endpoint to call `preprocess` function inside `utility.py` file.

**6.3 Node Manager:**
  - First service to be initialised by the bootstrapper.
  - Deploy all the services in the initial stage of bootstrapping process.
  - Creates a docker container for each of the services and Components deployed on the platform.
  - Runs these containers on nodes with least load.
  - Performs load balancing.

**6.4 Scheduler:**
  - Generates a config.json using the pipeline Components specified by the end-user through UI.
  - Execute the Component according to config.json by providing the input and fetching the output while checking the consistency i.e. output of one Component must match the input of next Component in the pipeline.
  - Provides the end output of pipeline to the UI.
  - Scheduler will be based on dispatcher-worker model which is a variant of master-slave model.
  - Dispatcher will recieve execution requests and generates `config.json` file based on the recieved request. It then pushes the request onto the message queue.
  - We will use Apache Kafka for message queue.
  - A PubSub architecture is supported by Apache Kafka, which means that users can publish and consume messages from a topic queue.

  ![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/scheduler.png)
  **Figure 2:** Scheduler Architecture

**6.5 Nodes:**
  - The nodes are running containers of different microservices and CV Tools which are deployed on the platform.

**6.6 Monitoring Service:**
  - Health check calls `/health` endpoint of every registered service to check if the service is running. If found not running, it communicates with Node Manager to get a machine with least load and run the service on that machine.
  - Health check pings all the service's IP to check if any machine is down or out of the network. If found not reachable, another instance of the same service is relaunched.


### 7. Representation:

**Use Case Diagram**

![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/UseCase_Diagram_DFS.png)

**Figure 3:** Use Case Diagram

</br>
</br>

**ER Diagram**

![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/ER_Diagram_DFS.png)

**Figure 4:** ER Diagram

</br>
</br>


</br>

Component Upload Sequence Diagram
![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/Sequence_Diagram1.png)

**Figure 5:** Sequence Diagram for Component Upload

</br>
</br>

Pipeline Working Sequence Diagram
![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/Sequence_Diagram2.png)

**Figure 6:** Sequence Diagram for Pipeline working

</br>
</br>

**Front-end**
</br>
![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/login_page.png)

**Figure 7:** Login Page

</br>
</br>

![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/home_page.png)

**Figure 8:** Home Page

</br>
</br>

![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/setup_pipeline.png)

**Figure 9:** Setup Pipeline

</br>
</br>

![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/cv_toolbar.png)

**Figure 9:** CV Toolbar

</br>
</br>

![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/view_results.png)

**Figure 10:** Pipeline Preview

</br>
</br>

![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/history_section.png)

**Figure 11:** History Section
</br>
</br>

![alt text](https://github.com/Jasika16/Straw-Hats/blob/main/Assets/Images/results_page.png)

**Figure 12:** Results Page

