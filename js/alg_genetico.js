//
// Algoritmo Genético escrito em JavaScript por Matheus Nogueira
// Disciplina: Inteligência artificial
//

/**
 * Classe que representa um indivíduo da população.
 *
 * Esta é responsável por todas as transformações que podem ocorrer nos
 * indivíduos, tais como, as operações necessárias para realizar o crossover
 * ou a mutação.
 *
 * @author Matheus Nogueira
 * @version 1.0
 */
function Solution()
{
    /// Valor do indivíduo
    this.value = 0;

    /// taxa de fitness do indivíduo
    this.fitness = 0;

    /// Valor convertido para binário.
    this.bin = undefined;

    /**
     * Função responsável por converter o valor para binário e decimal.
     * @param base base que o número está. [2, 10]
     */
    this.convert = function(base)
    {
        var aux = 1;
        if (base == 2) {
            var bin = ((this.value >>> 0) + ((this.value >= 0)? 0 : -1)).toString(base);
            this.bin = ((this.value > 0)? '0' : '') + bin;
        }
        else if (base == 10) {
            if (this.bin.length == 32) {
                for (var i = 0; i < 32; ++i) {
                    this.bin = this.bin.substr(0, i) + ((this.bin[i] === '1')? '0' : '1') + this.bin.substr(i+1);
                }
                aux = -1;
            }
            this.value = parseInt(this.bin, 2) * aux;
        }
    }

    /**
     * Função usada para fazer um swap entre dois indivíduos da população, 
     * trocando um certo treixo da parte binária de cada um.
     *
     * Exemplo:
     * a : 101100100
     * b : 110111001
     * a': 100111100
     * b': 111100001
     *
     * @param ind indivíduo que será usado para fazer o swap.
     * @param min limite minimo do swap.
     * @param max limite maximo do swap.
     */
    this.swap = function(ind, min, max)
    {
        var a = this.bin.substr(min, (max-min));
        var b = ind.bin.substr(min, (max-min));
        this.bin = this.bin.substr(0, min) + b + this.bin.substr(max);
        ind.bin = ind.bin.substr(0, min) + a + ind.bin.substr(max);
        this.convert(2);
        ind.convert(2);
    }
}

/**
 * Classe que representa o conjunto de soluções para o problema.
 *
 * Esta classe será usada pelo algoritmo para encontrar a melhor
 * solução para o nosso problema.
 *
 * @author Matheus Nogueira
 * @version 1.0
 */
function SolutionSet()
{
    /// Array que contém todas as possíveis soluções do problema.
    this.set = [];

    /// Limite inferior de valores que podem ser usados como solução
    this.lowerLimit = null;

    /// Limite superior de valores que podem ser usados como solução
    this.upperLimit = null;

    /// Função que será usada para medir a qualidade de um indivíduo da população
    this.fitnessFunc = null;

    /// Soma dos fatores de fitness de cada indivíduo
    this.sumFitness = 0;

    /**
     * Método usado para definir os limites da função.
     *
     * @param lower limite inferior da função
     * @param upper limite superior da função
     * @return void
     */
    this.setLimits = function(lower, upper)
    {
        this.lowerLimit = lower;
        this.upperLimit = upper;
    }

    /**
     * Define qual função será usada para definir o fator de fitness de um
     * indivíduo da população.
     *
     * Esta função deverá receber um número inteiro, que representa o
     * indivíduo, e deverá retornar um número inteiro, que representará o
     * fator de fitness do indivíduo.
     *
     * @param func função que calculará o fitness dos indivíduos
     * @return void
     */
    this.defineFitnessFunction = function(func)
    {
        this.fitnessFunc = func;
    }

    /**
     * Inicializa o conjunto de possíveis soluções aleatóriamente.
     * Você deve definir os limites da função antes de usar este método.
     *
     * @param number número de indivíduos da sua população
     * @return void
     */
    this.init = function(number)
    {
        for(var i = 0; i < number; ++i) {
            var valor = Math.floor((Math.random() * this.upperLimit*2) + this.lowerLimit);
            var individuo = new Solution();
            individuo.value = valor;
            individuo.convert(2);
            this.set.push(individuo);
        }
    }

    /**
     * Função usada para calcular o fator de fitness de todos os indivíduos,
     * e atualizá-los.
     *
     * @return void
     */
    this.recalculateFitness = function()
    {
        this.sumFitness = 0;
        var size = this.set.length;
        for (var i = 0; i < size; ++i) {
            var fitness = this.fitnessFunc(this.set[i].value);
            this.set[i].fitness = (fitness > 0) ? fitness : 0;
            this.sumFitness += this.set[i].fitness;
        }
        // ordena o fitness de forma decrescente
        this.set.sort(function(a, b) {return a.value - b.value});
    }

    /**
     * Sorteia um indivíduo da população usando as taxas de fitness para
     * influenciar a escolha.
     *
     * Quanto maior o fitness, maior a chance de ser escolhido pelo sorteio.
     *
     * O elemento será removido da população e retornado pela função.
     * @return o indivíduo escolhido.
     */
    this.getRandomIndividual = function()
    {
    	var sum = 0;
    	var random = Math.random();
    	var i = -1;
    	while (sum < random && i < this.set.length-1) {
            ++i;
    		sum += (this.set[i].fitness / this.sumFitness);
    	}
    	var element = this.set[i];
    	if (element !== undefined) {
    		this.sumFitness -= element.fitness;
    		this.set.splice(i, 1);
    	}
    	return element;
    }
}

/**
 * Classe responsável por tratar todos os assuntos referentes ao algoritmo
 * genético em si, sem se preocupar de como o conjunto de indivíduos estão
 * sendo armazenados ou gerenciados.
 *
 * @author Matheus Nogueira
 * @version 1.0
 */
function GeneticAlgorithm()
{

    /// Taxa de mutação do algoritmo
    this.mutationRate = 0;

    /// Taxa de crossover do algoritmo
    this.crossoverRate = 0;

    /// Conjunto de indivíduos
    this.population = undefined;

    /// Função de callback que será chamada após cada geração.
    this.callback = undefined;

    /// número de gerações que serão geradas.
    this.generations = 0;

    /// Número de gerações que foram geradas até dado momento.
    this.generation = 0;

    /// Maior valor gerado pelo algoritmo antes do filtro
    this.highest = undefined;

    /// Menor valor gerado pelo algoritmo antes do filtro
    this.lowest = undefined;

    /**
     * Define a taxa de crossover do algoritmo.
     *
     * @param rate taxa de crossover que será usada [0-100]
     * @return void
     */
    this.setCrossoverRate = function(rate)
    {
        this.crossoverRate = (rate / 100);
    }

     /**
     * Define a taxa de mutação do algoritmo.
     *
     * @param rate taxa de mutação que será usada [0-100]
     * @return void
     */
    this.setMutationRate = function(rate)
    {
        this.mutationRate = (rate / 100);
    }


    /**
     * Função responsável por fazer o crossover entre dois indivíduos da
     * população.
     *
     * O resultado do crossover será retornado pelas variaveis passadas
     * para a mesma, portanto, os dois indivíduos passados serão atualizados.
     *
     * @param a indíviduo que passará pelo crossover
     * @param b indíviduo que parrará pelo crossover
     * @return void
     */
    this.crossover = function(a, b)
    {
        // calcula qual indivíduo é menor (em número de bits)
        var maxBits = ((a.bin.length > b.bin.length)? b.bin.length : a.bin.length)-1;
        // Faz crossover ate os valores estarem entre os limites
        // calcula a faixa de crossover entre os dois indivíduos
        var min = Math.floor(Math.random() * maxBits-1) + 1;
        var max = Math.floor(Math.random() * (maxBits-min)) + min;
        //var max = min+1;
        // troca todos os bits na faixa de crossover
        // o algoritmo usado deve ser definido pelo usuário.
        this.crossoverFunc(a, b, min, max);
        // Depois de fazer o crossover, faz a mutação dos novos indivíduos
        // se eles forem sorteados.
        if (Math.random() <= this.mutationRate) {
        	this.mutate(a);
        }
        if (Math.random() <= this.mutationRate) {
        	this.mutate(b);
        }
        // Atualiza o valor decimal
        a.convert(10);
        b.convert(10);
    }

    /**
     * Função responsável por aplicar um método de crossover entre dois
     * indivíduos.
     *
     * @param a indivíduo que passará pelo crossover
     * @param b indivíduo que passará pelo crossover
     * @param min limite inferior da faixa de crossover
     * @param max limite superior da faixa de crossover
     * @return void
     */
    this.crossoverFunc = function(a, b, min, max)
    {
        // Você deve implementar este método!
    }

    /**
     * Função responsável por aplicar a mutação em um indivíduo.
     *
     * @param ind indivíduo que sofrerá mutação.
     */
    this.mutate = function(ind)
    {
    	// Implementar mutação aqui.
    }

    /**
     * Função usada para configurar o algoritmo.
     *
     * Você deverá iniciar o conjunto de indivíduos que serão usados no
     * algoritmo.
     *
     * Faça o que você quiser nessa função, ela é responsável por saciar
     * todos os requisitos de seu algoritmo.
     *
     * @return void
     */
    this.configure = function() 
    {
        // Implemente a sua configuração aqui.
    }

    /**
     * Função usada para definir quais indivíduos da população serão
     * selecionados para fazer crossover ou sofre mutação.
     *
     * Esta função usará as taxas de mutação e crossover especificadas pelo
     * usuário.
     *
     * Note que a população será alterada quando este método for chamado.
     *
     * @param population instância de um SolutionSet que representa a população.
     * @return void
     */
    this.changePopulation = function()
    {
    	var random;
    	var i = this.population.set.length;
    	var population_set = [];

    	while (i > 0 && population_set.length < 30) {
    		random = Math.random();
    		// checa se haverá crossover
    		if (random <= this.crossoverRate && this.population.set.length >= 2) {
    			// Escolhe dois indivíduos da população
    			var ind1 = this.population.getRandomIndividual();
    			var ind2 = this.population.getRandomIndividual();
                // Mantem os individuos originais
    			population_set.push(ind1);
    			population_set.push(ind2);

                // Faz uma copia deles
                var b_ind1 = new Solution();
                b_ind1.value = ind1.value;
                b_ind1.fitness = ind1.fitness;
                b_ind1.bin = ind1.bin;

                var b_ind2 = new Solution();
                b_ind2.value = ind2.value;
                b_ind2.fitness = ind2.fitness;
                b_ind2.bin = ind2.bin;
                // Faz o crossover dos indivíduos
                this.crossover(b_ind1, b_ind2);
                population_set.push(b_ind1);
                population_set.push(b_ind2);
                // desta maneira, mantemos os melhores individuos da nossa
                // populacao.
    			i--;
    		} else {
                // Nao faz crossover, eh eliminado.
    			this.population.getRandomIndividual();
                --i;
    		}
    	}
        if (population_set.length > 30) {
            population_set = population_set.slice(0, 30);
        }
        this.population.set = population_set;
    }

    /**
     * Começa o algoritmo.
     * 
     * Você poderá passar uma função de callback para esta função. Este
     * callback será chamado a cada termino de geração, e passará como
     * parâmetros da função o número da geração e o array de indivíduos
     * que constituem a nova geração formada. Desta forma você pode monitorar
     * a evolução do algoritmo a cada geração.
     *
     * @param func função que será chamada a cada vez que uma geração terminar.
     * @return void
     */
    this.start = function(func)
    {
    	// Configura o algoritmo antes de começar a execução
        this.configure();

        console.log("Start");

        this.callback = func;

        // Chama a função externa para a população randomica.
        if (this.callback !== undefined)
            this.callback(0, this.population.set);
        // Indica que nenhuma geração foi gerada ainda.
        this.generation = 0;
    }

    /**
     * Indica para o controlador do algoritmo que ele deve executar mais uma
     * geração.
     *
     * @return void
     */
    this.nextGeneration = function(func)
    {
        // Checa se ainda há gerações para serem geradas
        if (this.generation <= this.generations) {
            // Recalcula fator de fitness da população
            this.population.recalculateFitness();
            // Checa se haverá crossover ou mutação nos indivíduos da população.
            this.changePopulation();
            // Chama o callback
            if (func !== undefined)
                func(this.generation, this.population.set);
            ++this.generation;
        }
    }
}