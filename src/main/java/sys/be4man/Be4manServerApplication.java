package sys.be4man;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class Be4manServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(Be4manServerApplication.class, args);
    }

}
