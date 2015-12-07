/**
 * Implementação dos métodos abstratos da classe GeneticAlgorithm.
 *
 * @author Matheus Nogueira
 * @version 1.0
 */
function AlgoritmoGenetico()
{
	this.configure = function()
	{
		// Cria população
		this.population = new SolutionSet();
		this.population.setLimits(-10, 10);
		this.population.init(30);
		this.population.defineFitnessFunction(this.calculateFitness);
		this.generations = 200;

		// Configura o algoritmo
		this.setCrossoverRate(70);	// 70%
		this.setMutationRate(1);	// 01%
	}

	this.calculateFitness = function(x)
	{
		if (x > this.upperLimit || x < this.lowerLimit)
			return 0;
        return Math.pow(x, 2) + 2*x - 5*x + 4;
    }

    this.crossoverFunc = function(a, b, min, max)
    {
        console.log(a.value);
        a.swap(b, min, max);
        console.log(a.value);
    }

    this.mutate = function(a) {
    	var size = a.bin.length;
        var index = Math.floor(Math.random() * Math.abs(size -2)) + 1;
        var bit = a.bin[index];
        a.bin = a.bin.substr(0, index) + ((bit == '1') ? '0' : '1') + a.bin.substr(index+1);   
    }
}

AlgoritmoGenetico.prototype = new GeneticAlgorithm();