define([
    './fork',
    './def/es-proposals',
    './def/jsx',
    './def/flow',
    './def/esprima',
    './def/babel',
    './def/typescript',
    './types',
    './gen/namedTypes',
    './gen/visitor'
], function (fork, esProposalsDef, jsxDef, flowDef, esprimaDef, babelDef, typescriptDef, m_types, m_namedTypes, m_visitor) {
    'use strict';
    const {ASTNode, AnyType, Field} = m_types;
    const {namedTypes} = m_namedTypes;
    const {Visitor} = m_visitor;
    const {
        astNodesAreEquivalent,
        builders,
        builtInTypes,
        defineMethod,
        eachField,
        finalize,
        getBuilderName,
        getFieldNames,
        getFieldValue,
        getSupertypeNames,
        namedTypes: n,
        NodePath,
        Path,
        PathVisitor,
        someField,
        Type,
        use,
        visit
    } = fork([
        esProposalsDef,
        jsxDef,
        flowDef,
        esprimaDef,
        babelDef,
        typescriptDef
    ]);
    Object.assign(namedTypes, n);
    return {
        AnyType,
        ASTNode,
        astNodesAreEquivalent,
        builders,
        builtInTypes,
        defineMethod,
        eachField,
        Field,
        finalize,
        getBuilderName,
        getFieldNames,
        getFieldValue,
        getSupertypeNames,
        namedTypes,
        NodePath,
        Path,
        PathVisitor,
        someField,
        Type,
        use,
        visit,
        Visitor
    };
});