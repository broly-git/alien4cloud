package alien4cloud.it;

import org.junit.Ignore;
import org.junit.runner.RunWith;

import cucumber.api.CucumberOptions;
import cucumber.api.junit.Cucumber;

@RunWith(Cucumber.class)
@CucumberOptions(features = {
        //
        "classpath:alien/rest/application-version"
        //
}, format = { "pretty", "html:target/cucumber/application-version", "json:target/cucumber/cucumber-application-version.json" })
//@Ignore
public class RunApplicationVersionIT {
}
