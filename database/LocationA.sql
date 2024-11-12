-- Create Database
CREATE DATABASE LocationA;
USE LocationA;

-- Products Table
CREATE TABLE Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL
);

-- Inventory Table
CREATE TABLE Inventory (
    InventoryID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT,
    Stock INT,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
