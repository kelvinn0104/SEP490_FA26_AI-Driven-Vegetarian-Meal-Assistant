-- Keep the nutrition triggers working for API connections with the default search_path.
DO $$
DECLARE
    signature text;
BEGIN
    FOREACH signature IN ARRAY ARRAY[
        'fn_recalc_recipe_nutrition(integer)',
        'trg_recipe_ingredient_changed()',
        'trg_ingredient_nutrition_changed()',
        'trg_recipe_servings_changed()'
    ] LOOP
        IF to_regprocedure('veggieai.' || signature) IS NOT NULL THEN
            EXECUTE 'ALTER FUNCTION veggieai.' || signature || ' SET search_path TO pg_catalog, veggieai, pg_temp';
        END IF;
    END LOOP;
END $$;
