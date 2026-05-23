CREATE OR ALTER PROCEDURE [dbo].[usp_AuditLog_GetByEntity]
    @EntityName NVARCHAR(100),
    @EntityId   NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, UserId, UserEmail, Action, EntityName, EntityId, OldValues, NewValues, IpAddress, CreatedAt
    FROM [AuditLogs]
    WHERE EntityName = @EntityName AND EntityId = @EntityId
    ORDER BY CreatedAt DESC;
END
