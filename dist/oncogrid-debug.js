(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Copyright 2016(c) The Ontario Institute for Cancer Research. All rights reserved.
 *
 * This program and the accompanying materials are made available under the terms of the GNU Public
 * License v3.0. You should have received a copy of the GNU General Public License along with this
 * program. If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 * WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


var OncoHistogram;

(function() {
  'use strict';

  OncoHistogram = function(params) {
    var _self = this;

    _self.observations = params.observations;
    _self.domain = params.domain;
  };

  // TODO: Finish this implementation
}());

module.exports = OncoHistogram;
},{}],2:[function(require,module,exports){
/*
 * Copyright 2016(c) The Ontario Institute for Cancer Research. All rights reserved.
 *
 * This program and the accompanying materials are made available under the terms of the GNU Public
 * License v3.0. You should have received a copy of the GNU General Public License along with this
 * program. If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 * WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var MainGrid;

(function() {
  'use strict';

  MainGrid = function (params, func) {
    var _self = this;

    _self.prefix = params.prefix || 'og-';

    _self.donors = params.donors || [];
    _self.genes = params.genes || [];
    _self.observations = params.observations || [];
    _self.element = params.element || 'body';

    _self.colorMap = params.colorMap || {
          'missense_variant': '#ff825a',
          'frameshift_variant': '#57dba4',
          'stop_gained': '#af57db',
          'start_lost': '#af57db',
          'stop_lost': '#ffe',
          'initiator_codon_variant': '#af57db'
        };

    _self.width = params.width || 500;
    _self.height = params.height || 500;

    _self.margin = params.margin || { top: 10, right: 15, bottom: 15, left: 80 };

    _self.numDonors = _self.donors.length;
    _self.numGenes = _self.genes.length;

    _self.cellWidth = _self.width / _self.donors.length;
    _self.cellHeight = _self.height / _self.genes.length;

    _self.heatMap = params.heatMap;

    _self.updateCallback = func;

    _self.init();
  };


  MainGrid.prototype.init = function() {
    var _self = this;

    _self.div = d3.select(_self.element).append('div')
        .attr('class', _self.prefix + 'tooltip-oncogrid')
        .style('opacity', 0);

    _self.svg = d3.select(_self.element).append('svg')
        .attr('class', _self.prefix + 'maingrid-svg')
        .attr('width', _self.width + _self.margin.left + _self.margin.right)
        .attr('height', _self.height + _self.margin.top + _self.margin.bottom)
        .style('margin-left', _self.margin.left + 'px')
        .append('g')
        .attr('transform', 'translate(' + _self.margin.left + ',' + _self.margin.top + ')');

    _self.svg.append('rect')
        .attr('class', 'background')
        .attr('width', _self.width)
        .attr('height', _self.height);
  };

  /**
   * Only to be called the first time the OncoGrid is rendered. It creates the rects representing the
   * mutation occurrences.
   */
  MainGrid.prototype.render = function() {
    var _self = this;

    _self.computeCoordinates();

    _self.row.append('text')
        .attr('class', 'gene-label label-text-font')
        .transition()
        .attr('x', -6)
        .attr('y', _self.cellHeight / 2)
        .attr('dy', '.32em')
        .attr('text-anchor', 'end')
        .text(function(d, i) {
          return _self.genes[i].symbol;
        });

    _self.defineRowDragBehaviour();

    _self.svg.selectAll('svg')
        .data(_self.observations).enter()
        .append('rect')
        .on('mouseover', function(d) {
          _self.div.transition()
              .duration(200)
              .style('opacity', 0.9);
          _self.div.html(d.donorId + '<br/>' + d.gene + '<br/>' + d.id)
              .style('left', (d3.event.pageX + 10) + 'px')
              .style('top', (d3.event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          _self.div.transition()
              .duration(500)
              .style('opacity', 0);
        })
        .on('click', function(d) {
          // TODO: Make this configurable
          // window.location = '/mutations/' + d.id;
        })
        .transition()
        .attr('class', function(d) { return 'sortable-rect ' + d.donorId + '-cell ' + d.gene + '-cell'; })
        .attr('cons', function(d) { return d.consequence; })
        .attr('x', function(d) { return _self.x(_self.getDonorIndex(_self.donors, d.donorId)); })
        .attr('y', function(d) { return _self.getY(d); })
        .attr('width', _self.cellWidth)
        .attr('height', function(d) { return _self.getHeight(d); })
        .attr('fill', function(d) { return _self.getColor(d); })
        .attr('opacity', function(d) { return _self.getOpacity(d); })
        .attr('stroke-width', 2);
  };

  /**
   * Render function ensures presentation matches the data. Called after modifying data.
   */
  MainGrid.prototype.update = function() {
    var _self = this;

    if (_self.numDonors !== _self.donors.length || _self.numGenes !== _self.genes.length) {
      _self.numDonors = _self.donors.length;
      _self.numGenes = _self.genes.length;
      _self.computeCoordinates();
    }

    d3.selectAll('.row')
        .transition()
        .attr('transform', function(d) {
          return 'translate( 0, ' + _self.y(_self.genes.indexOf(d)) + ')';
        });

    d3.selectAll('.sortable-rect')
        .transition()
        .attr('y', function(d) {
          return _self.getY(d);
        })
        .attr('x', function(d) { return _self.x(_self.getDonorIndex(_self.donors, d.donorId)); });
  };

  /**
   * Updates coordinate system
   */
  MainGrid.prototype.computeCoordinates = function() {
    var _self = this;

    _self.x = d3.scale.ordinal()
        .domain(d3.range(_self.donors.length))
        .rangeBands([0, _self.width]);
    _self.cellWidth = _self.width / _self.donors.length;

    if (typeof _self.column !== 'undefined') {
      _self.column.remove();
    }

    _self.column = _self.svg.selectAll('.column')
        .data(_self.donors)
        .enter().append('g')
        .attr('class', 'column')
        .attr('donor', function(d) { return d.donorId; })
        .attr('transform', function(d, i) { return 'translate(' + _self.x(i) + ')rotate(-90)'; });

    _self.column.append('line')
        .attr('x1', -_self.width);

    _self.y = d3.scale.ordinal()
        .domain(d3.range(_self.genes.length))
        .rangeBands([0, _self.height]);
    _self.cellHeight = _self.height / _self.genes.length;

    if (typeof _self.row !== 'undefined') {
      _self.row.remove();
    }

    _self.row = _self.svg.selectAll('.row')
        .data(_self.genes)
        .enter().append('g')
        .attr('class', 'row')
        .attr('transform', function(d, i) { return 'translate(0,' + _self.y(i) + ')'; });

    _self.row.append('line')
        .attr('x2', _self.width);

    _self.row.append('text')
        .attr('class', 'gene-label label-text-font')
        .transition()
        .attr('x', -6)
        .attr('y', _self.cellHeight / 2)
        .attr('dy', '.32em')
        .attr('text-anchor', 'end')
        .text(function(d, i) {
          return _self.genes[i].symbol;
        });

    _self.defineRowDragBehaviour();
  };

  /**
   * Defines the row drag behaviour for moving genes and binds it to the row elements.
   */
  MainGrid.prototype.defineRowDragBehaviour = function() {
    var _self = this;

    var drag = d3.behavior.drag();
    drag.on('dragstart', function() {
      d3.event.sourceEvent.stopPropagation(); // silence other listeners
    });
    drag.on('drag', function(d) {
      var trans = d3.event.dy;
      var dragged = _self.genes.indexOf(d);
      var selection = d3.select(this);

      selection.attr('transform', function() {
        var transform = d3.transform(d3.select(this).attr('transform'));
        return 'translate( 0, ' + (parseInt(transform.translate[1]) + trans) + ')';
      });

      var newY = d3.transform(d3.select(this).attr('transform')).translate[1];

      d3.selectAll('.row').each(function(f) {
        var curGeneIndex = _self.genes.indexOf(f);
        var curGene, yCoord;
        if (trans > 0 && curGeneIndex > dragged) {
          yCoord = d3.transform(d3.select(this).attr('transform')).translate[1];
          if (newY > yCoord) {
            curGene = _self.genes[dragged];
            _self.genes[dragged] = _self.genes[curGeneIndex];
            _self.genes[curGeneIndex] = curGene;
          }
        } else if (trans < 0 && curGeneIndex < dragged) {
          yCoord = d3.transform(d3.select(this).attr('transform')).translate[1];
          if (newY < yCoord) {
            curGene = _self.genes[dragged];
            _self.genes[dragged] = _self.genes[curGeneIndex];
            _self.genes[curGeneIndex] = curGene;
          }
        }
      });
    });

    drag.on('dragend', function() {
      _self.updateCallback(true);
    });

    var dragSelection = d3.selectAll('.row').call(drag);
    dragSelection.on('click', function() {
      if (d3.event.defaultPrevented) {
      }
    });
  };


  /**
   * Function that determines the y position of a mutation within a cell
   */
  MainGrid.prototype.getY = function(d) {
    var _self = this;

    var pseudo_genes = _self.genes.map(function(g) {
      return g.id;
    });

    if (_self.heatMap === true) {
      return _self.y(pseudo_genes.indexOf(d.gene));
    }

    var keys = Object.keys(_self.colorMap);
    return  _self.y(pseudo_genes.indexOf(d.gene)) + (_self.cellHeight / keys.length) *
        (keys.indexOf(d.consequence) - 1);
  };

  MainGrid.prototype.getColor = function(d) {
    var _self = this;

    if (_self.heatMap === true) {
      return '#D33682';
    } else {
      return _self.colorMap[d.consequence];
    }
  };

  MainGrid.prototype.getOpacity = function() {
    var _self = this;

    if (_self.heatMap === true) {
      return 0.3;
    } else {
      return 1;
    }
  };

  MainGrid.prototype.getHeight = function() {
    var _self = this;

    if (_self.heatMap === true) {
      return _self.cellHeight;
    } else {
      return _self.cellHeight / Object.keys(_self.colorMap).length;
    }
  };

  MainGrid.prototype.toggleHeatmap = function() {
    var _self = this;

    _self.heatMap = _self.heatMap !== true;

    d3.selectAll('.sortable-rect')
        .transition()
        .attr('y', function(d) {
          return _self.getY(d);
        })
        .attr('height', function(d) { return _self.getHeight(d); })
        .attr('fill', function(d) { return _self.getColor(d); })
        .attr('opacity', function(d) { return _self.getOpacity(d); });
  };

  /**
   * Helper for getting donor index position
   */
  MainGrid.prototype.getDonorIndex = function(donors, donorId) {
    for (var i = 0; i < donors.length; i++) {
      var donor = donors[i];
      if (donor.donorId === donorId) {
        return i;
      }
    }

    return -1;
  };

  MainGrid.prototype.destroy = function() {
    var _self = this;

    d3.select(_self.element).select('.' + _self.prefix +'maingrid-svg').remove();
    d3.select(_self.element).select('.'+ _self.prefix + 'tooltip-oncogrid').remove();
  };

}());

module.exports = MainGrid;

},{}],3:[function(require,module,exports){
/*
 * Copyright 2016(c) The Ontario Institute for Cancer Research. All rights reserved.
 *
 * This program and the accompanying materials are made available under the terms of the GNU Public
 * License v3.0. You should have received a copy of the GNU General Public License along with this
 * program. If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 * WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

MainGrid = require('./MainGrid');
OncoHistogram = require('./Histogram');

var OncoGrid;

(function (){
  'use strict';

  OncoGrid = function(params) {
    var _self = this;

    _self.donors = params.donors || [];
    _self.genes = params.genes || [];
    _self.observations = params.observations || [];

    _self.computeGeneScores();
    _self.computeScores();
    _self.sortByScores();

    _self.mainGrid = new MainGrid(params, _self.update(_self));

    _self.charts = [];
    _self.charts.push(_self.mainGrid);
  };

  /**
   * Initializes and creates the main SVG with rows and columns. Does prelim sort on data
   */
  OncoGrid.prototype.render = function() {
    var _self = this;

    _self.charts.forEach(function(chart) {
        chart.render();
    });
  };

  /**
   * Updates all charts
   */
  OncoGrid.prototype.update = function(scope) {
    var _self = scope;

    return function(donorSort) {
      donorSort = (typeof donorSort === 'undefined' || donorSort === null) ? false: donorSort;

      if (donorSort) {
        _self.computeScores();
        _self.sortByScores();
      }

      _self.charts.forEach(function (chart) {
        chart.update();
      });
    };
  };

  /**
   * Sorts donors by score
   */
  OncoGrid.prototype.sortByScores = function() {
    var _self = this;

    _self.donors.sort(_self.sortScore);
  };

  OncoGrid.prototype.genesSortbyScores = function() {
    var _self = this;

    _self.genes.sort(_self.sortScore);
  };

  /**
   * Helper for getting donor index position
   */
  OncoGrid.prototype.getDonorIndex = function(donors, donorId) {
    for (var i = 0; i < donors.length; i++) {
      var donor = donors[i];
      if (donor.donorId === donorId) {
        return i;
      }
    }

    return -1;
  };

  OncoGrid.prototype.cluster = function() {
    var _self = this;

    _self.computeGeneScores();
    _self.genesSortbyScores();
    _self.computeScores();
    _self.sortByScores();
    _self.update(_self)();
  };

  OncoGrid.prototype.removeDonors = function(func) {
    var _self = this;

    var removedList = [];

    // Remove donors from data
    for (var i = 0; i < _self.donors.length; i++) {
      var donor = _self.donors[i];
      if (func(donor)) {
        removedList.push(donor.donorId);
        d3.selectAll('.' + donor.donorId + '-cell').remove();
        d3.selectAll('.' + donor.donorId + '-bar').remove();
        _self.donors.splice(i, 1);
        i--;
      }
    }

    for (var j = 0; j < _self.observations.length; j++) {
      var obs = _self.observations[j];
      if (_self.donors.indexOf(obs.donorId) >= 0) {
        _self.observations.splice(j, 1);
        j--;
      }
    }

    _self.update(_self)();
  };

  OncoGrid.prototype.removeGenes = function(func) {
    var _self = this;

    var removedList = [];

    // Remove genes from data
    for (var i = 0; i < _self.genes.length; i++) {
      var gene = _self.genes[i];
      if (func(gene)) {
        removedList.push(gene.id);
        d3.selectAll('.' + gene.id + '-cell').remove();
        _self.genes.splice(i, 1);
        i--;
      }
    }

    _self.update(_self)();
  };

  OncoGrid.prototype.sortDonors = function(func) {
    var _self = this;

    _self.donors.sort(func);
    _self.update(_self)();
  };

  OncoGrid.prototype.toggleHeatmap = function() {
    var _self = this;

    _self.mainGrid.toggleHeatmap();
  };

  /**
   * Returns 1 if at least one mutation, 0 otherwise.
   */
  OncoGrid.prototype.mutationScore = function(donor, gene) {
    var _self = this;

    for (var i = 0; i < _self.observations.length; i++) {
      var obs = _self.observations[i];
      if (obs.donorId === donor && obs.gene === gene) {
        return 1;
      }
    }

    return 0;
  };

  /**
   * Returns 1 if at least one mutation, 0 otherwise.
   */
  OncoGrid.prototype.mutationGeneScore = function(donor, gene) {
    var _self = this;

    var retVal = 0;
    for (var i = 0; i < _self.observations.length; i++) {
      var obs = _self.observations[i];
      if (obs.gene === gene && obs.gene === gene) {
        retVal++;
      }
    }

    return retVal;
  };

  /**
   * Computes scores for donor sorting.
   */
  OncoGrid.prototype.computeScores = function() {
    var _self = this;

    for (var i = 0; i < _self.donors.length; i++) {
      var donor = _self.donors[i];
      donor.score = 0;
      for (var j = 0; j < _self.genes.length; j++) {
        var gene = _self.genes[j];
        donor.score += (_self.mutationScore(donor.donorId, gene.id) * Math.pow(2, _self.genes.length + 1 - j));
      }
    }

  };

  OncoGrid.prototype.computeGeneScores = function() {
    var _self = this;

    for (var i = 0; i < _self.genes.length; i++) {
      var gene = _self.genes[i];
      gene.score = 0;
      for (var j = 0; j < _self.donors.length; j++) {
        var donor = _self.donors[j];
        gene.score += _self.mutationGeneScore(donor.donorId, gene.id);
      }
    }
  };

  /**
   * Comparator for scores
   */
  OncoGrid.prototype.sortScore = function(a, b) {
    if (a.score < b.score) {
      return 1;
    } else if (a.score > b.score) {
      return -1;
    } else {
      return 0;
    }
  };

  OncoGrid.prototype.destroy = function() {
    var _self = this;

    _self.charts.forEach(function (chart) {
      chart.destroy();
    });
  };

}());

module.exports = OncoGrid;
},{"./Histogram":1,"./MainGrid":2}],4:[function(require,module,exports){
/*
 * Copyright 2016(c) The Ontario Institute for Cancer Research. All rights reserved.
 *
 * This program and the accompanying materials are made available under the terms of the GNU Public
 * License v3.0. You should have received a copy of the GNU General Public License along with this
 * program. If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 * WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


window.OncoGrid = require('./OncoGrid');
},{"./OncoGrid":3}]},{},[4])