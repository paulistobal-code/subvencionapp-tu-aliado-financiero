-- Desprogramar versiones anteriores (idempotente)
DO $$
DECLARE
  j RECORD;
BEGIN
  FOR j IN SELECT jobname FROM cron.job WHERE jobname IN ('scrape-bdns-daily') LOOP
    PERFORM cron.unschedule(j.jobname);
  END LOOP;
END $$;

-- Programar scraper diario a las 03:00 UTC
SELECT cron.schedule(
  'scrape-bdns-daily',
  '0 3 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://project--e65308e1-c186-4e73-993f-da943c091479.lovable.app/api/public/cron/scrape-bdns',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Y3RpY3dscWtudXZ2andtcGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3ODQwNjAsImV4cCI6MjA5NDM2MDA2MH0.1AReJ5BAYFQ5yqKmcmHDWR8EVZjAu_dx_5om4a-k7to"}'::jsonb,
    body := '{}'::jsonb
  );
  $cron$
);