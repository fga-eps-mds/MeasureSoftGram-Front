const translateMeasures = (measure: string) => ({
  passed_tests: 'Testes aprovados',
  fast_test_builds: 'Compilações rápidas de teste',
  test_coverage: 'Cobertura de teste',
  non_complex_files_density: 'Densidade de arquivos não complexos',
  commented_files_density: 'Densidade de arquivos comentados',
  absence_of_duplications: 'Ausência de duplicações',
}[measure])

export default translateMeasures;
