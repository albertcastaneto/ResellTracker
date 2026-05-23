CREATE OR ALTER PROCEDURE [dbo].[usp_Suppliers_Update]
    @Id       UNIQUEIDENTIFIER,
    @Name     NVARCHAR(150),
    @Type     NVARCHAR(50),
    @Location NVARCHAR(200)  = NULL,
    @Notes    NVARCHAR(1000) = NULL,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [Suppliers]
    SET Name     = @Name,
        Type     = @Type,
        Location = @Location,
        Notes    = @Notes,
        IsActive = @IsActive
    WHERE Id = @Id;
END
