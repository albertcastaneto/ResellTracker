CREATE OR ALTER PROCEDURE [dbo].[usp_AuditLog_GetByUser]
    @UserEmail NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, UserId, UserEmail, Action, EntityName, EntityId, OldValues, NewValues, IpAddress, CreatedAt
    FROM [AuditLogs]
    WHERE UserEmail = @UserEmail
    ORDER BY CreatedAt DESC;
END
