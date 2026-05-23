CREATE OR ALTER PROCEDURE [dbo].[usp_Suppliers_Insert]
    @Name     NVARCHAR(150),
    @Type     NVARCHAR(50),
    @Location NVARCHAR(200) = NULL,
    @Notes    NVARCHAR(1000) = NULL,
    @IsActive BIT,
    @NewId    UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @NewId = NEWID();
    INSERT INTO [Suppliers] (Id, Name, Type, Location, Notes, IsActive, CreatedAt)
    VALUES (@NewId, @Name, @Type, @Location, @Notes, @IsActive, GETUTCDATE());
END
