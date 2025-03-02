# PYQ-Adda  

**PYA-Adda** is a Previous Year Question (PYQ) Software-as-a-Service (SaaS) platform designed to help aspirants prepare for various competitive exams efficiently. The platform provides easy access to previous year questions, enabling users to streamline their preparation and focus on the most relevant material.  

## Features  

- **Comprehensive Question Database**: Access a curated collection of previous year questions for various exams.  
- **User-Friendly Interface**: Intuitive and seamless experience for users to search and browse questions.  
- **Search and Filter Options**: Easily find questions based on specific topics, years, or difficulty levels.  
- **Responsive Design**: Optimized for both desktop and mobile devices.  
- **Scalable Architecture**: Designed to handle growing user traffic and expanding datasets.  

## Tech Stack  

The project is built using the following technologies:  

- **Frontend**:  
  - HTML, CSS, JavaScript  
  - React.js (for dynamic user interfaces)  

- **Backend**:  
  - Python  
  - Django (REST framework for API development)  

- **Database**:  
  - PostgreSQL  

- **Hosting and Deployment**:  
  - Docker (for containerization)  
  - AWS (for scalable deployment)  

- **Additional Tools**:  
  - Celery (for task queue management)  
  - Redis (as a message broker)  

## Installation  

To set up **PYQ-Adda**, follow these steps:  

1. **Clone the Repository**:  
   ```bash  
   git clone https://github.com/Itssshikhar/pyq-saas.git  
   cd pyq-saas  
   ```  

2. **Set Up a Virtual Environment** (recommended):  
   ```bash  
   python -m venv env  
   source env/bin/activate  # On Windows: env\Scripts\activate  
   ```  

3. **Install Dependencies**:  
   ```bash  
   pip install -r requirements.txt  
   ```  

4. **Set Up Environment Variables**:  
   Create a `.env` file in the project root and configure it using the provided `.env-sample` template.  

5. **Database Setup**:  
   ```sql  
   CREATE DATABASE pyq_saas_db;  
   ```  
   Update the `DATABASE_URL` in your `.env` file with your database credentials.  

6. **Run Migrations**:  
   ```bash  
   python manage.py migrate  
   ```  

7. **Run the Application**:  
   ```bash  
   python manage.py runserver  
   ```  
   The app will be available at `http://localhost:8000`.  

## Usage  

- **Access PYQs**: Browse and search for previous year questions by subject, year, or topic.  
- **Admin Dashboard**: Manage questions, users, and settings through the admin interface at `http://localhost:8000/admin`.  

## Contributing  

We welcome contributions to improve **PYQ-Adda**.  

1. Fork the repository.  
2. Create a feature branch.  
3. Commit changes with descriptive messages.  
4. Push the branch to your fork and open a pull request.  

Refer to our [Contributing Guide](CONTRIBUTING.md) for more details.  

## License  

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.  
