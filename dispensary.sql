USE dispensary;
SET time_zone = '+05:30';
create table DoctorTable(id INT AUTO_INCREMENT PRIMARY KEY ,email varchar(255) UNIQUE KEY,name varchar(30), phone varchar(11), password varchar(255));
create table PharmaTable(id INT AUTO_INCREMENT PRIMARY KEY ,email varchar(255) UNIQUE KEY,name varchar(30), phone varchar(11), password varchar(255));
create table PatientTable(id INT auto_increment PRIMARY KEY,doctor INT,rollno VARCHAR(11),name VARCHAR(20), age INT, gender ENUM('male', 'female') NOT NULL, hostel VARCHAR(20),symptom VARCHAR(50), time DATETIME);
create table MedicineTable(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(50),unit INT);
create table CustomerTable(id INT,rollno VARCHAR(11),name VARCHAR(20),hostel VARCHAR(20),drugid INT,units INT,time DATETIME);
create table AdminTable(id INT AUTO_INCREMENT PRIMARY KEY ,email varchar(255) UNIQUE KEY,name varchar(30), phone varchar(11), password varchar(255));

insert into AdminTable(email,name,password) values('iamadmin@gmail.com','9999999999',MD5('iamadmin'));
insert into DoctorTable(email,name,phone,password) values('pratul@gmail.com','Pratul Kumar','9340308417',md5('Pratul@412'));
insert into PharmaTable(email,name,phone,password) values('madhukesh@gmail.com','Madhukesh Kumar','7903389305',md5('Madhukesh@k3'));


select * from DoctorTable;
select * from PharmaTable;
select * from CustomerTable;
SELECT * FROM MedicineTable;
select * from PatientTable;
