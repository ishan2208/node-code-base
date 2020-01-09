CREATE OR REPLACE FUNCTION create_agency_business_hours(agencyId INT)
RETURNS void AS
$$
DECLARE startTime varchar(5);
DECLARE endTime varchar(5);

BEGIN

  startTime := '09:00';
  endTime := '17:00';

  INSERT INTO config_agency_business_hours(agency_id, day, start_time, end_time, created_at)
  VALUES
    (agencyId, 'SUNDAY', null, null, now()),
    (agencyId, 'MONDAY', startTime, endTime, now()),
    (agencyId, 'TUESDAY', startTime, endTime, now()),
    (agencyId, 'WEDNESDAY', startTime, endTime, now()),
    (agencyId, 'THURSDAY', startTime, endTime, now()),
    (agencyId, 'FRIDAY', startTime, endTime, now()),
    (agencyId, 'SATURDAY', null, null, now());

END; $$
LANGUAGE PLPGSQL;