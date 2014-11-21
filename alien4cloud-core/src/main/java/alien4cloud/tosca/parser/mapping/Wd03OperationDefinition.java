package alien4cloud.tosca.parser.mapping;

import java.util.Collection;

import javax.annotation.Resource;

import org.springframework.stereotype.Component;

import alien4cloud.tosca.container.model.type.Operation;
import alien4cloud.tosca.parser.MappingTarget;
import alien4cloud.tosca.parser.impl.advanced.BoundParser;
import alien4cloud.tosca.parser.impl.advanced.ImplementationArtifactParser;
import alien4cloud.tosca.parser.impl.base.ListParser;
import alien4cloud.tosca.parser.impl.base.MapParser;
import alien4cloud.tosca.parser.impl.base.TypeNodeParser;

@Component
public class Wd03OperationDefinition extends AbstractMapper<Operation> {
    @Resource
    private ImplementationArtifactParser implementationArtifactParser;
    @Resource
    private BoundParser boundParser;

    public Wd03OperationDefinition() {
        super(new TypeNodeParser<Operation>(Operation.class, "Capability definition"));
    }

    @Override
    public void initMapping() {
        instance.getYamlToObjectMapping().put("implementation", new MappingTarget("implementationArtifact", implementationArtifactParser));
        quickMap("description");
        // support both as there is some issues in some scripts...
        quickMap(new MapParser<Collection<String>>(new ListParser<String>(getScalarParser(), "capabilities properties"), "properties"), "input");
        quickMap(new MapParser<Collection<String>>(new ListParser<String>(getScalarParser(), "capabilities properties"), "properties"), "inputs");
    }
}